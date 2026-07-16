export const TUNISIAN_GOVERNORATES = [
  'Tunis',
  'Ariana',
  'Ben Arous',
  'Manouba',
  'Nabeul',
  'Zaghouan',
  'Bizerte',
  'Béja',
  'Jendouba',
  'Kef',
  'Siliana',
  'Sousse',
  'Monastir',
  'Mahdia',
  'Sfax',
  'Kairouan',
  'Kasserine',
  'Sidi Bouzid',
  'Gabès',
  'Médenine',
  'Tataouine',
  'Gafsa',
  'Tozeur',
  'Kébili',
] as const

export function isValidTunisianPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-().]/g, '')
  return /^(\+216|00216|216)?[24579]\d{7}$/.test(cleaned)
}

export function formatTunisianPhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-().]/g, '')
  const digits = cleaned.replace(/^(\+216|00216|216)/, '')
  if (digits.length === 8) {
    return `+216 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`
  }
  return phone
}
