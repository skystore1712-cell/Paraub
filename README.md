# ParaPharma TN

موقع بارapharmacie تونسي — البيانات محفوظة في ملفات JSON.

## هيكل البيانات

```
data/
  products.json    ← المنتجات والمخزون
  users.json       ← المستخدمين
  categories.json  ← الفئات
  orders.json      ← الطلبات
```

## التشغيل

```bash
npm install
npm run dev
```

يشغّل السيرفر (`localhost:3001`) + الواجهة (`localhost:5173`) معاً.

## حساب الإدارة

- **Email:** admin@parapharma.tn
- **Password:** admin123

## استيراد الفواتير (AI)

لتفعيل قراءة الفواتير بالذكاء الاصطناعي (دقة عالية):

1. احصل على مفتاح مجاني من [Google AI Studio](https://aistudio.google.com/apikey)
2. أنشئ ملف `.env` في جذر المشروع:
   ```
   GEMINI_API_KEY=your_key_here
   ```
3. أعد تشغيل السيرفر

بدون المفتاح، يعمل النظام بوضع OCR (أقل دقة).

## ملاحظة

أي تعديل من لوحة الإدارة (إضافة/حذف منتج، رفع فاتورة، طلب جديد) يُحفظ مباشرة في ملفات `data/`.
