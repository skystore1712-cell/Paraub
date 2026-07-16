import type { ParsedInvoice, InvoiceItem } from '../types'

const PRICE_REGEX = /(\d{1,6}[.,]\d{2,3})/g
const SKIP_PATTERNS = [
  /total/i, /المجموع/, /facture/i, /فاتورة/, /tva/i, /date/i,
  /tel/i, /fax/i, /invoice/i, /sous[\s-]?total/i, /montant/i,
  /remise/i, /خصم/, /net\s*à\s*payer/i, /الصافي/, /page\s*\d/i,
  /adresse/i, /عنوان/, /rc\s*:/i, /mf\s*:/i, /matricule/i,
]

function parsePrice(raw: string): number {
  const cleaned = raw.replace(/[^\d.,]/g, '').replace(',', '.')
  const val = parseFloat(cleaned)
  return isNaN(val) ? 0 : val
}

function shouldSkipLine(line: string): boolean {
  const trimmed = line.trim()
  if (trimmed.length < 3) return true
  return SKIP_PATTERNS.some((p) => p.test(trimmed))
}

function extractPrices(line: string): number[] {
  const prices: number[] = []
  for (const match of line.matchAll(PRICE_REGEX)) {
    const price = parsePrice(match[1])
    if (price > 0.01 && price < 50000) prices.push(price)
  }
  return prices
}

function extractQuantity(text: string): { quantity: number; name: string } {
  const patterns = [
    /(?:^|\s)(?:x\s*|×\s*|qty\s*[:.]?\s*|qte\s*[:.]?\s*|كمية\s*[:.]?\s*)(\d{1,4})(?:\s|$)/i,
    /(?:^|\s)(\d{1,4})\s*(?:pcs?|pièces?|boîtes?|flacons?|unités?|وحدة|علبة)(?:\s|$)/i,
    /(?:^|\s)(\d{1,4})\s+(?=\d+[.,]\d)/,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      const qty = parseInt(match[1], 10)
      if (qty > 0 && qty <= 9999) {
        const name = text.replace(match[0], ' ').replace(/\s+/g, ' ').trim()
        return { quantity: qty, name }
      }
    }
  }

  return { quantity: 1, name: text }
}

function extractItemsFromLine(line: string): InvoiceItem | null {
  const trimmed = line.trim()
  if (shouldSkipLine(trimmed)) return null

  const prices = extractPrices(trimmed)
  if (prices.length === 0) return null

  const unitPrice = prices.length >= 2 ? prices[prices.length - 2] : prices[0]
  const priceIndex = trimmed.lastIndexOf(
    prices.length >= 2
      ? String(prices[prices.length - 2]).replace('.', '[.,]')
      : String(prices[0]).replace('.', '[.,]')
  )

  let namePart = priceIndex > 0 ? trimmed.slice(0, priceIndex).trim() : trimmed
  namePart = namePart.replace(PRICE_REGEX, '').replace(/[-–—|]+/g, ' ').replace(/\s+/g, ' ').trim()

  if (namePart.length < 2) return null

  const { quantity, name } = extractQuantity(namePart)
  if (name.length < 2) return null

  return {
    name,
    price: unitPrice,
    quantity,
    confidence: prices.length >= 2 ? 'high' : 'medium',
  }
}

function extractInvoiceTotal(text: string): number | undefined {
  const totalPatterns = [
    /(?:total|المجموع|net\s*à\s*payer|الصافي|montant\s*total)[:\s]*(\d+[.,]\d{2,3})/i,
    /(\d+[.,]\d{2,3})\s*(?:د\.?ت|TND|DT)\s*$/im,
  ]

  for (const pattern of totalPatterns) {
    const match = text.match(pattern)
    if (match) {
      const val = parsePrice(match[1])
      if (val > 0) return val
    }
  }
  return undefined
}

function validateItems(items: InvoiceItem[], invoiceTotal?: number): string[] {
  const warnings: string[] = []

  if (items.length === 0) {
    warnings.push('لم يتم اكتشاف أي منتج — أضفها يدوياً أو جرّب صورة أوضح')
    return warnings
  }

  const calculatedTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  if (invoiceTotal && invoiceTotal > 0) {
    const diff = Math.abs(calculatedTotal - invoiceTotal)
    const tolerance = Math.max(invoiceTotal * 0.08, 1)
    if (diff > tolerance) {
      warnings.push(
        `المجموع المحسوب (${calculatedTotal.toFixed(3)} د.ت) لا يطابق مجموع الفاتورة (${invoiceTotal.toFixed(3)} د.ت) — راجع الأسعار والكميات`
      )
    }
  }

  const lowConfidence = items.filter((i) => i.confidence === 'low' || i.confidence === 'medium')
  if (lowConfidence.length > 0) {
    warnings.push(`${lowConfidence.length} منتج(ات) تحتاج مراجعة يدوية`)
  }

  return warnings
}

export function parseInvoiceText(text: string): ParsedInvoice {
  const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean)
  const items: InvoiceItem[] = []
  const seen = new Set<string>()

  for (const line of lines) {
    const item = extractItemsFromLine(line)
    if (item) {
      const key = item.name.toLowerCase()
      if (!seen.has(key)) {
        seen.add(key)
        items.push(item)
      }
    }
  }

  if (items.length === 0) {
    const tabLines = text.split(/\n/).filter((l) => l.trim().length > 5)
    for (const line of tabLines) {
      const cols = line.split(/\t+|\s{2,}/).map((c) => c.trim()).filter(Boolean)
      if (cols.length >= 2) {
        const prices = cols.map((c) => parsePrice(c)).filter((p) => p > 0.01)
        const textCols = cols.filter((c) => parsePrice(c) === 0 || !PRICE_REGEX.test(c))
        if (textCols.length > 0 && prices.length > 0) {
          const name = textCols[0]
          const price = prices.length >= 2 ? prices[prices.length - 2] : prices[0]
          const qtyCol = cols.find((c) => /^\d{1,4}$/.test(c))
          const quantity = qtyCol ? parseInt(qtyCol, 10) : 1
          const key = name.toLowerCase()
          if (!seen.has(key) && name.length >= 2) {
            seen.add(key)
            items.push({ name, price, quantity: quantity || 1, confidence: 'medium' })
          }
        }
      }
    }
  }

  const invoiceTotal = extractInvoiceTotal(text)
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const warnings = validateItems(items, invoiceTotal)

  return { items, total, invoiceTotal, rawText: text, warnings, source: 'ocr' }
}

async function preprocessImage(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement('canvas')
      const maxDim = 2000
      let { width, height } = img

      if (width > maxDim || height > maxDim) {
        const scale = maxDim / Math.max(width, height)
        width = Math.round(width * scale)
        height = Math.round(height * scale)
      }

      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) { resolve(file); return }

      ctx.drawImage(img, 0, 0, width, height)
      const imageData = ctx.getImageData(0, 0, width, height)
      const data = imageData.data

      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
        const contrast = 1.4
        const factor = (259 * (contrast * 100 + 255)) / (255 * (259 - contrast * 100))
        const enhanced = factor * (gray - 128) + 128
        const val = Math.max(0, Math.min(255, enhanced))
        data[i] = data[i + 1] = data[i + 2] = val
      }

      ctx.putImageData(imageData, 0, 0)
      canvas.toBlob((blob) => resolve(blob || file), 'image/png')
    }

    img.onerror = () => { URL.revokeObjectURL(url); resolve(file) }
    img.src = url
  })
}

let workerInstance: import('tesseract.js').Worker | null = null

async function getWorker() {
  if (!workerInstance) {
    const { createWorker, PSM } = await import('tesseract.js')
    workerInstance = await createWorker('fra+ara+eng', 1, {
      logger: () => {},
    })
    await workerInstance.setParameters({
      tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
      preserve_interword_spaces: '1',
    })
  }
  return workerInstance
}

export async function extractTextFromImage(
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  const processed = await preprocessImage(file)
  const worker = await getWorker()

  const { data } = await worker.recognize(processed, {}, {
    text: true,
    blocks: false,
    hocr: false,
    tsv: false,
  })

  onProgress?.(100)
  return data.text
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
