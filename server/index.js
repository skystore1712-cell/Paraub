import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '..', '.env')

if (existsSync(envPath)) {
  const lines = readFileSync(envPath, 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim()
      const val = trimmed.slice(eqIdx + 1).trim()
      if (!process.env[key]) process.env[key] = val
    }
  }
}

const { default: app } = await import('./app.js')

const PORT = 3001

app.listen(PORT, () => {
  const aiStatus = process.env.GEMINI_API_KEY ? 'AI activé' : 'OCR seulement (ajoutez GEMINI_API_KEY)'
  console.log(`API server running on http://localhost:${PORT} — ${aiStatus}`)
})
