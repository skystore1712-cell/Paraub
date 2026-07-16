import { useState, useRef, useEffect } from 'react'
import {
  Upload, FileText, CheckCircle, AlertCircle, Loader2,
  Plus, Trash2, Sparkles, Eye, AlertTriangle,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { extractTextFromImage, parseInvoiceText, fileToBase64 } from '../utils/invoiceParser'
import { formatPrice } from '../utils/helpers'
import { api } from '../services/api'
import type { InvoiceItem } from '../types'

export default function InvoiceUpload() {
  const { addProductsFromInvoice } = useApp()
  const fileRef = useRef<HTMLInputElement>(null)

  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [rawText, setRawText] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [progress, setProgress] = useState(0)
  const [warnings, setWarnings] = useState<string[]>([])
  const [invoiceTotal, setInvoiceTotal] = useState<number | undefined>()
  const [source, setSource] = useState<'ai' | 'ocr' | null>(null)
  const [aiAvailable, setAiAvailable] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    api.getInvoiceStatus().then((s) => setAiAvailable(s.aiAvailable)).catch(() => {})
  }, [])

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('يرجى رفع صورة (JPG, PNG)')
      return
    }

    setError('')
    setSuccess(false)
    setItems([])
    setWarnings([])
    setInvoiceTotal(undefined)
    setSource(null)
    setLoading(true)
    setProgress(10)

    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)

    try {
      let parsed

      if (aiAvailable) {
        setProgress(30)
        const base64 = await fileToBase64(file)
        setProgress(50)
        parsed = await api.parseInvoice(base64, file.type)
        setProgress(90)
        setSource('ai')
      } else {
        setProgress(20)
        const text = await extractTextFromImage(file, (pct) => setProgress(20 + pct * 0.6))
        setRawText(text)
        setProgress(85)
        parsed = parseInvoiceText(text)
        setSource('ocr')
      }

      if (parsed.items.length === 0) {
        setError('لم يتم اكتشاف منتجات في الفاتورة. أضفها يدوياً أو جرّب صورة أوضح.')
      }

      setItems(parsed.items)
      setWarnings(parsed.warnings || [])
      setInvoiceTotal(parsed.invoiceTotal)
      if (parsed.rawText) setRawText(parsed.rawText)
      setProgress(100)
    } catch (err) {
      if (aiAvailable) {
        try {
          setProgress(30)
          const text = await extractTextFromImage(file)
          setRawText(text)
          const parsed = parseInvoiceText(text)
          setItems(parsed.items)
          setWarnings([...(parsed.warnings || []), 'تم استخدام OCR كبديل — راجع المنتجات بعناية'])
          setInvoiceTotal(parsed.invoiceTotal)
          setSource('ocr')
          setProgress(100)
        } catch {
          setError('فشلت قراءة الفاتورة. أضف المنتجات يدوياً.')
        }
      } else {
        setError(err instanceof Error ? err.message : 'فشلت قراءة الفاتورة. أضف المنتجات يدوياً.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const addManualItem = () => {
    setItems((prev) => [...prev, { name: '', price: 0, quantity: 1 }])
  }

  const handleImport = async () => {
    const valid = items.filter((i) => i.name.trim() && i.price > 0)
    if (valid.length === 0) {
      setError('أضف منتجاً واحداً على الأقل باسم وسعر صحيحين')
      return
    }
    setShowConfirm(true)
  }

  const confirmImport = async () => {
    const valid = items.filter((i) => i.name.trim() && i.price > 0)
    await addProductsFromInvoice(valid)
    setSuccess(true)
    setItems([])
    setPreview(null)
    setRawText('')
    setWarnings([])
    setInvoiceTotal(undefined)
    setSource(null)
    setShowConfirm(false)
    setTimeout(() => setSuccess(false), 5000)
  }

  const calculatedTotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const totalMismatch = invoiceTotal
    ? Math.abs(calculatedTotal - invoiceTotal) > Math.max(invoiceTotal * 0.05, 0.5)
    : false

  const confidenceColor = (c?: string) => {
    if (c === 'high') return 'bg-green-100 text-green-700'
    if (c === 'medium') return 'bg-amber-100 text-amber-700'
    return 'bg-red-100 text-red-700'
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
      <div className="mb-8">
        <h1 className="page-title">استيراد فاتورة</h1>
        <p className="page-subtitle">
          ارفع صورة الفاتورة — الذكاء الاصطناعي يقرأ المنتجات والأسعار والكميات تلقائياً
        </p>
        {aiAvailable ? (
          <div className="mt-2 flex items-center gap-2 text-sm text-primary-600">
            <Sparkles className="h-4 w-4" />
            <span>الذكاء الاصطناعي مفعّل — قراءة دقيقة للفواتير</span>
          </div>
        ) : (
          <div className="mt-2 flex items-center gap-2 text-sm text-amber-600">
            <AlertTriangle className="h-4 w-4" />
            <span>وضع OCR — أضف GEMINI_API_KEY في .env لتفعيل الذكاء الاصطناعي</span>
          </div>
        )}
      </div>

      {success && (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-primary-100 px-4 py-3 text-primary-700">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">تمت إضافة المنتجات إلى المتجر بنجاح!</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => !loading && fileRef.current?.click()}
            className="card flex cursor-pointer flex-col items-center justify-center border-2 border-dashed border-primary-200 py-12 transition-colors hover:border-primary-400 hover:bg-primary-50/50"
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />

            {loading ? (
              <div className="text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary-500" />
                <p className="mt-4 font-medium text-teal-text">
                  {aiAvailable ? 'الذكاء الاصطناعي يقرأ الفاتورة...' : 'جاري قراءة الفاتورة...'}
                </p>
                <div className="mx-auto mt-3 h-2 w-48 overflow-hidden rounded-full bg-primary-100">
                  <div className="h-full rounded-full bg-primary-500 transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            ) : preview ? (
              <img src={preview} alt="Facture" className="max-h-64 rounded-xl object-contain" />
            ) : (
              <>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
                  <Upload className="h-8 w-8" />
                </div>
                <p className="mt-4 font-semibold text-teal-text">اسحب الفاتورة هنا</p>
                <p className="mt-1 text-sm text-teal-muted">أو اضغط لاختيار ملف (JPG, PNG)</p>
              </>
            )}
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {warnings.length > 0 && (
            <div className="mt-4 space-y-2">
              {warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-2 text-sm text-amber-700">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  {w}
                </div>
              ))}
            </div>
          )}

          {rawText && source === 'ocr' && (
            <details className="mt-4 card !p-4">
              <summary className="cursor-pointer text-sm font-medium text-teal-muted flex items-center gap-2">
                <FileText className="h-4 w-4" />
                النص المستخرج من الفاتورة
              </summary>
              <pre className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap text-xs text-teal-light leading-relaxed">
                {rawText}
              </pre>
            </details>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-teal-text">المنتجات المستخرجة</h2>
              {source && (
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${source === 'ai' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}`}>
                  {source === 'ai' ? 'AI' : 'OCR'}
                </span>
              )}
            </div>
            <button onClick={addManualItem} className="btn-secondary !px-3 !py-1.5 !text-xs">
              <Plus className="h-3.5 w-3.5" />
              إضافة يدوية
            </button>
          </div>

          {items.length === 0 ? (
            <div className="card py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-primary-200" />
              <p className="mt-3 text-teal-muted">ارفع فاتورة لاستخراج المنتجات تلقائياً</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {items.map((item, index) => (
                  <div key={index} className="card !p-3 flex items-start gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          value={item.name}
                          onChange={(e) => updateItem(index, 'name', e.target.value)}
                          placeholder="اسم المنتج"
                          className="input-field !py-2 text-sm flex-1"
                        />
                        {item.confidence && (
                          <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${confidenceColor(item.confidence)}`}>
                            <Eye className="inline h-2.5 w-2.5 mr-0.5" />
                            {item.confidence === 'high' ? 'دقيق' : item.confidence === 'medium' ? 'راجع' : 'تحقق'}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-teal-muted">السعر (د.ت)</label>
                          <input
                            type="number"
                            step="0.001"
                            value={item.price || ''}
                            onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                            className="input-field !py-1.5 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-teal-muted">الكمية (ستوك)</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                            className="input-field !py-1.5 text-sm"
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-teal-muted">
                        المجموع: {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(index)}
                      className="mt-1 text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4 card !p-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-teal-text">المجموع المحسوب</span>
                    <span className={`text-xl font-bold ${totalMismatch ? 'text-amber-600' : 'text-primary-600'}`}>
                      {formatPrice(calculatedTotal)}
                    </span>
                  </div>
                  {invoiceTotal !== undefined && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-teal-muted">مجموع الفاتورة</span>
                      <span className={`font-medium ${totalMismatch ? 'text-amber-600' : 'text-teal-text'}`}>
                        {formatPrice(invoiceTotal)}
                        {totalMismatch && <AlertTriangle className="inline h-3.5 w-3.5 ml-1" />}
                      </span>
                    </div>
                  )}
                </div>
                <button onClick={handleImport} className="btn-primary mt-4 w-full !py-3">
                  <CheckCircle className="h-4 w-4" />
                  إضافة {items.length} منتج إلى المتجر
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="card max-w-md w-full !p-6">
            <h3 className="text-lg font-bold text-teal-text mb-3">تأكيد الإضافة</h3>
            <p className="text-sm text-teal-muted mb-4">
              سيتم إضافة {items.filter((i) => i.name.trim() && i.price > 0).length} منتج إلى المتجر.
              {totalMismatch && ' تنبيه: المجموع لا يطابق الفاتورة — تأكد من صحة البيانات.'}
            </p>
            <div className="flex gap-3">
              <button onClick={confirmImport} className="btn-primary flex-1">
                <CheckCircle className="h-4 w-4" />
                تأكيد
              </button>
              <button onClick={() => setShowConfirm(false)} className="btn-secondary flex-1">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
