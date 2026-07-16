export const DELIVERY_FEE = 8

export function formatPrice(amount: number): string {
  return `${amount.toFixed(3).replace('.', ',')} DT`
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
