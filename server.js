import express from 'express'
import cors from 'cors'
import XLSX from 'xlsx'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

const EXCEL_DIR = path.join(__dirname, 'excel')
const EXCEL_FILE = path.join(EXCEL_DIR, 'localizacoes.xlsx')

// Garante que a pasta excel existe
if (!fs.existsSync(EXCEL_DIR)) {
  fs.mkdirSync(EXCEL_DIR)
  console.log('📁 Pasta "excel" criada.')
}

app.post('/api/salvar-localizacao', (req, res) => {
  const { latitude, longitude, precisao_m, horario } = req.body

  if (!latitude || !longitude) {
    return res.status(400).json({ erro: 'Dados de localização inválidos.' })
  }

  // Lê o arquivo existente ou cria novo
  let wb
  let registros = []

  if (fs.existsSync(EXCEL_FILE)) {
    wb = XLSX.readFile(EXCEL_FILE)
    const ws = wb.Sheets['Localizações']
    registros = XLSX.utils.sheet_to_json(ws)
  } else {
    wb = XLSX.utils.book_new()
  }

  // Adiciona novo registro
  registros.push({
    '#': registros.length + 1,
    'Latitude': latitude,
    'Longitude': longitude,
    'Precisão (m)': precisao_m,
    'Horário': horario,
  })

  // Salva no arquivo
  const ws = XLSX.utils.json_to_sheet(registros)
  ws['!cols'] = [{ wch: 4 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 22 }]

  if (wb.SheetNames.includes('Localizações')) {
    wb.Sheets['Localizações'] = ws
  } else {
    XLSX.utils.book_append_sheet(wb, ws, 'Localizações')
  }

  XLSX.writeFile(wb, EXCEL_FILE)

  console.log(`✅ Localização #${registros.length} salva: ${latitude}, ${longitude}`)
  res.json({ ok: true, total: registros.length, arquivo: EXCEL_FILE })
})

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`)
  console.log(`📂 Salvando em: ${EXCEL_FILE}`)
})
