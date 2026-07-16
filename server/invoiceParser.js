const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

const INVOICE_PROMPT = `أنت خبير في قراءة فواتير الصيدليات والمخازن الطبية في تونس.
مهمتك: قراءة صورة الفاتورة بدقة كإنسان محترف واستخراج كل المنتجات.

قواعد صارمة:
1. اقرأ كل سطر منتج في الفاتورة — لا تتخطى أي منتج
2. لكل منتج استخرج:
   - name: اسم المنتج كما هو مكتوب بالضبط (عربي أو فرنسي)
   - price: سعر الوحدة الواحدة بالدينار التونسي (DT/TND) — ليس المجموع
   - quantity: الكمية/العدد المشترى (الستوك)
3. تجاهل: رأس الفاتورة، التذييل، المجموع الكلي، TVA، التاريخ، الهاتف، العنوان
4. إذا كان السطر يحتوي على: سعر الوحدة + الكمية + المجموع → خذ سعر الوحدة فقط
5. الأسعار التونسية غالباً بصيغة 12.500 أو 12,500 (ثلاث خانات عشرية)
6. إذا لم تستطع تحديد الكمية، ضع 1
7. لا تخترع منتجات غير موجودة في الصورة
8. لا تكرر نفس المنتج

أرجع JSON فقط بدون أي نص إضافي بهذا الشكل:
{
  "items": [
    { "name": "اسم المنتج", "price": 12.500, "quantity": 2 }
  ],
  "invoiceTotal": 25.000,
  "currency": "TND"
}`

function parseAIResponse(text) {
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Réponse IA invalide')

  const parsed = JSON.parse(jsonMatch[0])
  const items = (parsed.items || [])
    .map((item) => ({
      name: String(item.name || '').trim(),
      price: normalizePrice(item.price),
      quantity: Math.max(1, parseInt(item.quantity, 10) || 1),
      confidence: 'high',
    }))
    .filter((item) => item.name.length >= 2 && item.price > 0)

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const invoiceTotal = parsed.invoiceTotal ? normalizePrice(parsed.invoiceTotal) : undefined
  const warnings = validateItems(items, invoiceTotal)

  return {
    items,
    total,
    invoiceTotal,
    rawText: text,
    warnings,
    source: 'ai',
  }
}

function normalizePrice(value) {
  if (typeof value === 'number') return value
  const cleaned = String(value).replace(/[^\d.,]/g, '').replace(',', '.')
  const val = parseFloat(cleaned)
  return isNaN(val) ? 0 : val
}

function validateItems(items, invoiceTotal) {
  const warnings = []

  if (items.length === 0) {
    warnings.push('Aucun produit détecté dans la facture')
    return warnings
  }

  const calculatedTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  if (invoiceTotal && invoiceTotal > 0) {
    const diff = Math.abs(calculatedTotal - invoiceTotal)
    const tolerance = Math.max(invoiceTotal * 0.05, 0.5)
    if (diff > tolerance) {
      warnings.push(
        `Le total calculé (${calculatedTotal.toFixed(3)} DT) ne correspond pas au total de la facture (${invoiceTotal.toFixed(3)} DT). Vérifiez les prix et quantités.`
      )
    }
  }

  for (const item of items) {
    if (item.price > 500) {
      warnings.push(`Prix élevé pour "${item.name}" (${item.price} DT) — vérifiez`)
    }
    if (item.price < 0.1) {
      warnings.push(`Prix très bas pour "${item.name}" (${item.price} DT) — vérifiez`)
    }
  }

  return warnings
}

export async function parseInvoiceWithAI(imageBase64, mimeType) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY non configurée')
  }

  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: INVOICE_PROMPT },
            {
              inline_data: {
                mime_type: mimeType || 'image/jpeg',
                data: imageBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json',
      },
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Erreur API Gemini: ${response.status} — ${err.slice(0, 200)}`)
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Aucune réponse de l\'IA')

  return parseAIResponse(text)
}

export function isAIAvailable() {
  return Boolean(process.env.GEMINI_API_KEY)
}
