export function formatarData(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR');
}

export function formatarReais(valor: number): string {
    return `R$ ${valor.toFixed(2).replace('.', ',')}`;
}

export function iniciais(nome: string): string {
    return nome.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}