import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SOURCE_DIR = path.join(__dirname, '..', 'data')
const TMP_DIR = '/tmp/parapublic-data'

let dataDir = null

async function ensureDataDir() {
  if (dataDir) return dataDir

  if (process.env.VERCEL) {
    try {
      await fs.access(TMP_DIR)
    } catch {
      await fs.mkdir(TMP_DIR, { recursive: true })
      const files = await fs.readdir(SOURCE_DIR)
      for (const file of files) {
        if (file.endsWith('.json')) {
          const content = await fs.readFile(path.join(SOURCE_DIR, file), 'utf-8')
          await fs.writeFile(path.join(TMP_DIR, file), content)
        }
      }
    }
    dataDir = TMP_DIR
  } else {
    dataDir = SOURCE_DIR
  }

  return dataDir
}

export async function readData(name) {
  const dir = await ensureDataDir()
  const raw = await fs.readFile(path.join(dir, name), 'utf-8')
  return JSON.parse(raw)
}

export async function writeData(name, data) {
  const dir = await ensureDataDir()
  await fs.writeFile(path.join(dir, name), JSON.stringify(data, null, 2), 'utf-8')
}
