import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

// Obs. são testes estáticos

const raiz = fileURLToPath(new URL('..', import.meta.url));
const caminho = (...partes) => raiz + partes.join('/');
const ler = (...partes) => readFileSync(caminho(...partes), 'utf8').replace(/\r\n/g, '\n');
const textoCompose = ler('compose.yml');
const compose = parse(textoCompose, { merge: true });
const servicos = compose.services;
const envExample = ler('.env.example');
const caddyfile = ler('Caddyfile');
const pacoteBackend = JSON.parse(ler('backend', 'package.json'));

function variaveisUsadas(texto) {
    const achados = [...texto.matchAll(/(?<!\$)\$\{([A-Z0-9_]+)(:?[-?])?([^}]*)\}/g)];
    return achados.map(([, nome, operador, resto]) => ({ nome, operador: operador ?? '', resto }));
}

const valorPadrao = (nome) => variaveisUsadas(textoCompose).find((v) => v.nome === nome && v.operador.endsWith('-'))?.resto;
const nomesDoEnvExample = [...envExample.matchAll(/^([A-Z0-9_]+)=/gm)].map((m) => m[1]);

describe('compose.yml: estrutura', () => {
    it('usa o nome de projeto "biblioteca"', () => {
        expect(compose.name).toBe('biblioteca');
    });

    it('define exatamente os serviços db, migrate, api, frontend e caddy', () => {
        expect(Object.keys(servicos).sort()).toEqual(['api', 'caddy', 'db', 'frontend', 'migrate']);
    });

    it('não usa imagens com tag "latest" nem sem tag', () => {
        for (const [nome, servico] of Object.entries(servicos)) {
            if (!servico.image || servico.image.startsWith('${')) continue;
            expect(servico.image, `serviço ${nome}`).toMatch(/:[^:]+$/);
            expect(servico.image, `serviço ${nome}`).not.toMatch(/:latest$/);
        }
    });

    it('api e migrate compartilham a mesma imagem do backend', () => {
        expect(servicos.api.image).toBe(servicos.migrate.image);
        expect(servicos.api.image).toContain('${BACKEND_IMAGE:-biblioteca-backend:local}');
    });

    it('db e caddy usam imagens oficiais', () => {
        expect(servicos.db.image).toMatch(/^postgres:\d+/);
        expect(servicos.caddy.image).toMatch(/^caddy:\d+/);
    });
});

describe('compose.yml: arquivos referenciados existem', () => {
    it.each(['api', 'migrate', 'frontend'])('o build de %s aponta para uma pasta com Dockerfile', (nome) => {
        const { context, dockerfile = 'Dockerfile' } = servicos[nome].build;
        expect(existsSync(caminho(context, dockerfile)), `${context}/${dockerfile}`).toBe(true);
    });

    it('o Caddyfile montado existe e é somente leitura', () => {
        const volume = servicos.caddy.volumes.find((v) => v.includes('/etc/caddy/Caddyfile'));
        expect(volume).toBe('./Caddyfile:/etc/caddy/Caddyfile:ro');
        expect(existsSync(caminho('Caddyfile'))).toBe(true);
    });

    it('o nginx.conf copiado pelo Dockerfile do frontend existe', () => {
        expect(ler('frontend', 'Dockerfile')).toContain('COPY nginx.conf');
        expect(existsSync(caminho('frontend', 'nginx.conf'))).toBe(true);
    });
});

describe('compose.yml: variáveis de ambiente', () => {
    it('toda variável sem valor padrão está documentada no .env.example', () => {
        const semPadrao = variaveisUsadas(textoCompose)
            .filter((v) => !v.operador.endsWith('-'))
            .map((v) => v.nome);

        expect(semPadrao.length).toBeGreaterThan(0);
        for (const nome of new Set(semPadrao)) {
            expect(nomesDoEnvExample, `${nome} falta no .env.example`).toContain(nome);
        }
    });

    it('variáveis obrigatórias (:?) trazem mensagem de erro explicativa', () => {
        const obrigatorias = variaveisUsadas(textoCompose).filter((v) => v.operador === ':?');
        expect(obrigatorias.map((v) => v.nome)).toEqual(
            expect.arrayContaining(['POSTGRES_DB', 'POSTGRES_USER', 'POSTGRES_PASSWORD', 'JWT_SECRET', 'EMAIL_USUARIO', 'EMAIL_SENHA']),
        );
        for (const v of obrigatorias) {
            expect(v.resto.trim(), `${v.nome} sem mensagem`).not.toBe('');
        }
    });

    it('os parâmetros de negócio no compose têm o mesmo padrão do .env.example', () => {
        const regras = ['PRAZO_EMPRESTIMO_DIAS', 'MULTA_POR_DIA', 'LIMITE_BLOQUEIO_MULTA', 'RESERVA_DIAS_RETIRADA', 'MAX_RENOVACOES', 'LEMBRETES_HORA', 'LEMBRETES_INTERVALO_MIN'];
        for (const nome of regras) {
            const noEnv = envExample.match(new RegExp(`^${nome}=(.*)$`, 'm'))?.[1].trim();
            expect(valorPadrao(nome), nome).toBe(noEnv);
        }
    });

    it('o .env (com segredos) está no .gitignore', () => {
        expect(ler('.gitignore').split(/\r?\n/)).toContain('.env');
    });

    it('a api recebe as variáveis que o backend usa para conectar no banco', () => {
        const env = servicos.api.environment;
        for (const chave of ['DATABASE_URL', 'DATABASE_HOST', 'DATABASE_PORT', 'DATABASE_NAME', 'DATABASE_USER', 'DATABASE_PASSWORD', 'JWT_SECRET']) {
            expect(env, chave).toHaveProperty(chave);
        }
        expect(env.DATABASE_HOST).toBe('db');
        expect(env.DATABASE_URL).toContain('@db:5432/');
    });
});

describe('compose.yml: ordem de inicialização e healthchecks', () => {
    it('api e migrate só sobem depois que o banco está saudável', () => {
        expect(servicos.api.depends_on.db.condition).toBe('service_healthy');
        expect(servicos.migrate.depends_on.db.condition).toBe('service_healthy');
    });

    it('o caddy só sobe depois que api e frontend estão saudáveis', () => {
        expect(servicos.caddy.depends_on.api.condition).toBe('service_healthy');
        expect(servicos.caddy.depends_on.frontend.condition).toBe('service_healthy');
    });

    it('todo serviço esperado com service_healthy tem healthcheck', () => {
        for (const [nome, servico] of Object.entries(servicos)) {
            for (const [dependencia, { condition }] of Object.entries(servico.depends_on ?? {})) {
                if (condition !== 'service_healthy') continue;
                expect(servicos[dependencia].healthcheck, `${nome} depende de ${dependencia}`).toBeDefined();
            }
        }
    });

    it('o healthcheck do banco usa $$ para ler as variáveis dentro do container', () => {
        const comando = servicos.db.healthcheck.test.join(' ');
        expect(comando).toContain('pg_isready');
        expect(comando).toContain('$$POSTGRES_USER');
        expect(comando).toContain('$$POSTGRES_DB');
    });

    it('o healthcheck da api consulta /health/live na porta padrão do PORT', () => {
        const comando = servicos.api.healthcheck.test.join(' ');
        expect(comando).toContain(`127.0.0.1:${valorPadrao('PORT')}/health/live`);
    });

    it('a api tem tempo de encerramento maior que o SHUTDOWN_TIMEOUT_MS', () => {
        const graceSegundos = Number(servicos.api.stop_grace_period.replace('s', ''));
        const shutdownMs = Number(valorPadrao('SHUTDOWN_TIMEOUT_MS'));
        expect(graceSegundos * 1000).toBeGreaterThan(shutdownMs);
    });

    it('o migrate roda uma vez (restart "no") e executa um script que existe no backend', () => {
        expect(servicos.migrate.restart).toBe('no');
        const [npm, run, script] = servicos.migrate.command;
        expect([npm, run]).toEqual(['npm', 'run']);
        expect(pacoteBackend.scripts).toHaveProperty(script);
    });

    it('os serviços de longa duração reiniciam, salvo se forem parados manualmente', () => {
        for (const nome of ['db', 'api', 'frontend', 'caddy']) {
            expect(servicos[nome].restart, nome).toBe('unless-stopped');
        }
    });
});

describe('compose.yml: redes e portas', () => {
    it('a rede "database" é interna (sem acesso à internet)', () => {
        expect(compose.networks.database.internal).toBe(true);
        expect(compose.networks.edge?.internal).toBeUndefined();
    });

    it.each([
        ['db', ['database']],
        ['migrate', ['database']],
        ['api', ['database', 'edge']],
        ['frontend', ['edge']],
        ['caddy', ['edge']],
    ])('%s está apenas nas redes esperadas', (nome, esperado) => {
        expect([...servicos[nome].networks].sort()).toEqual([...esperado].sort());
    });

    it('todas as redes usadas estão declaradas', () => {
        const usadas = new Set(Object.values(servicos).flatMap((s) => s.networks ?? []));
        for (const rede of usadas) expect(compose.networks).toHaveProperty(rede);
    });

    it('somente o caddy publica portas no host (80 e 443)', () => {
        for (const [nome, servico] of Object.entries(servicos)) {
            if (nome === 'caddy') continue;
            expect(servico.ports, `${nome} não deve publicar portas`).toBeUndefined();
        }
        expect(servicos.caddy.ports).toEqual(['80:80', '443:443']);
    });

    it('o Caddyfile encaminha /api para a api e o resto para o frontend, nas portas certas', () => {
        expect(caddyfile).toContain(`reverse_proxy api:${valorPadrao('PORT')}`);
        const portaFrontend = servicos.frontend.expose[0];
        expect(caddyfile).toContain(`reverse_proxy frontend:${portaFrontend}`);
        expect(ler('frontend', 'nginx.conf')).toContain(`listen ${portaFrontend};`);
    });
});

describe('compose.yml: volumes', () => {
    it('todo volume nomeado usado está declarado e nenhum declarado fica sem uso', () => {
        const usados = Object.values(servicos)
            .flatMap((s) => s.volumes ?? [])
            .map((v) => v.split(':')[0])
            .filter((origem) => !origem.startsWith('.') && !origem.startsWith('/'));

        const declarados = Object.keys(compose.volumes);
        for (const nome of usados) expect(declarados, nome).toContain(nome);
        for (const nome of declarados) expect(usados, `volume ${nome} sem uso`).toContain(nome);
    });

    it('o banco persiste os dados em volume nomeado', () => {
        expect(servicos.db.volumes).toContain('postgres_data:/var/lib/postgresql/data');
    });
});

describe('compose.yml: segurança do container da api', () => {
    it('roda com filesystem somente leitura e /tmp em memória', () => {
        expect(servicos.api.read_only).toBe(true);
        expect(servicos.api.tmpfs).toContain('/tmp');
    });

    it('remove todas as capabilities e bloqueia escalonamento de privilégio', () => {
        expect(servicos.api.cap_drop).toEqual(['ALL']);
        expect(servicos.api.security_opt).toContain('no-new-privileges:true');
    });

    it('usa init para tratar sinais e encerrar processos corretamente', () => {
        expect(servicos.api.init).toBe(true);
        expect(servicos.migrate.init).toBe(true);
    });

    it('o Dockerfile do backend roda como usuário "node" e expõe a mesma porta do compose', () => {
        const dockerfile = ler('backend', 'Dockerfile');
        expect(dockerfile).toMatch(/^USER node$/m);
        expect(dockerfile).toContain(`EXPOSE ${valorPadrao('PORT')}`);
    });
});