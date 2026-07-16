import express from 'express'
import cors from 'cors'
import crypto from 'crypto'
import { readData, writeData } from '../lib/storage.js'
import { parseInvoiceWithAI, isAIAvailable } from './invoiceParser.js'

const app = express()
app.use(cors())
app.use(express.json({ limit: '15mb' }))

function generateId() {
  return crypto.randomUUID()
}

app.get('/api/products', async (_req, res) => {
  try {
    res.json(await readData('products.json'))
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

app.post('/api/products', async (req, res) => {
  try {
    const products = await readData('products.json')
    const product = {
      ...req.body,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }
    products.push(product)
    await writeData('products.json', products)
    res.status(201).json(product)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

app.post('/api/products/bulk', async (req, res) => {
  try {
    const products = await readData('products.json')
    const newProducts = req.body.map((item) => ({
      id: generateId(),
      name: item.name,
      description: item.description || 'Produit ajouté depuis une facture',
      price: item.price,
      stock: item.quantity || item.stock || 1,
      category: item.category || 'Médicaments sans ordonnance',
      image: item.image || 'https://images.unsplash.com/photo-1587854692152-c1042659ba08?w=400&h=400&fit=crop',
      brand: item.brand || 'Non spécifié',
      createdAt: new Date().toISOString(),
    }))
    products.push(...newProducts)
    await writeData('products.json', products)
    res.status(201).json(newProducts)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

app.put('/api/products/:id', async (req, res) => {
  try {
    const products = await readData('products.json')
    const idx = products.findIndex((p) => p.id === req.params.id)
    if (idx === -1) return res.status(404).json({ error: 'Not found' })
    products[idx] = { ...products[idx], ...req.body }
    await writeData('products.json', products)
    res.json(products[idx])
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

app.delete('/api/products/:id', async (req, res) => {
  try {
    let products = await readData('products.json')
    products = products.filter((p) => p.id !== req.params.id)
    await writeData('products.json', products)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

app.get('/api/users', async (_req, res) => {
  try {
    const users = await readData('users.json')
    res.json(users.map(({ password, ...u }) => u))
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const users = await readData('users.json')
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })
    const { password: _, ...safe } = user
    res.json(safe)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

app.post('/api/auth/register', async (req, res) => {
  try {
    const users = await readData('users.json')
    if (users.find((u) => u.email.toLowerCase() === req.body.email.toLowerCase())) {
      return res.status(409).json({ error: 'Email already exists' })
    }
    const user = {
      ...req.body,
      id: generateId(),
      role: 'user',
      createdAt: new Date().toISOString(),
    }
    users.push(user)
    await writeData('users.json', users)
    const { password: _, ...safe } = user
    res.status(201).json(safe)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

app.put('/api/users/:id', async (req, res) => {
  try {
    const users = await readData('users.json')
    const idx = users.findIndex((u) => u.id === req.params.id)
    if (idx === -1) return res.status(404).json({ error: 'Not found' })
    users[idx] = { ...users[idx], ...req.body }
    await writeData('users.json', users)
    const { password: _, ...safe } = users[idx]
    res.json(safe)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

app.get('/api/orders', async (_req, res) => {
  try {
    res.json(await readData('orders.json'))
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

app.post('/api/orders', async (req, res) => {
  try {
    const orders = await readData('orders.json')
    const order = {
      ...req.body,
      status: req.body.status || 'pending',
      id: generateId(),
      createdAt: new Date().toISOString(),
    }
    orders.push(order)
    await writeData('orders.json', orders)

    if (req.body.items?.length) {
      const products = await readData('products.json')
      for (const item of req.body.items) {
        const p = products.find((pr) => pr.id === item.productId)
        if (p) p.stock = Math.max(0, p.stock - item.quantity)
      }
      await writeData('products.json', products)
    }

    res.status(201).json(order)
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

app.patch('/api/orders/:id', async (req, res) => {
  try {
    const orders = await readData('orders.json')
    const idx = orders.findIndex((o) => o.id === req.params.id)
    if (idx === -1) return res.status(404).json({ error: 'Not found' })

    const allowedStatuses = ['pending', 'confirmed', 'rejected', 'delivered']
    if (req.body.status && !allowedStatuses.includes(req.body.status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    orders[idx] = { ...orders[idx], ...req.body }
    await writeData('orders.json', orders)
    res.json(orders[idx])
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

app.get('/api/categories', async (_req, res) => {
  try {
    res.json(await readData('categories.json'))
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

app.get('/api/invoice/status', (_req, res) => {
  res.json({ aiAvailable: isAIAvailable() })
})

app.post('/api/invoice/parse', async (req, res) => {
  try {
    const { image, mimeType } = req.body
    if (!image) return res.status(400).json({ error: 'Image requise' })

    const base64 = image.replace(/^data:image\/\w+;base64,/, '')
    const result = await parseInvoiceWithAI(base64, mimeType || 'image/jpeg')
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) })
  }
})

export default app
