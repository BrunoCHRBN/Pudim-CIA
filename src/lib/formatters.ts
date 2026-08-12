export function formatCentsToBRL(cents: number): string {
  const reais = cents / 100;
  return `R$ ${reais.toFixed(2).replace('.', ',')}`;
}

export function formatBRL(valueInReais: number): string {
  return `R$ ${Number(valueInReais).toFixed(2).replace('.', ',')}`;
}
