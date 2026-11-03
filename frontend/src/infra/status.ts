export function statusClass(status: string): string {
    return status.toLowerCase();
}

export function getStatusClass(status: string): string {
    if (status === 'ATIVO') return 'ativo';
    if (status === 'DEVOLVIDO') return 'devolvido';
        return 'vencido';
}

export interface ExemplarDisponibilidade {
    disponivel: boolean;
}

export function getDisponibilidade(livro: { exemplares: ExemplarDisponibilidade[] }) {
    const total = livro.exemplares.length;
    const disponiveis = livro.exemplares.filter((e) => e.disponivel).length;
    
    if (disponiveis > 0) {
        return { status: 'disponivel', texto: `${disponiveis} ${disponiveis === 1 ? 'disponível' : 'disponíveis'}`,
    };
  }
    return { status: 'indisponivel', texto: total === 0 ? 'Sem exemplares' : 'Indisponível' };
}
