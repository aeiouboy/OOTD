import Papa from 'papaparse'
import { chunkTextByParagraph, type ChunkedText } from '@/lib/utils/text-chunker'

const SUPPORTED_EXTENSIONS = ['csv', 'pdf', 'docx', 'xlsx'] as const

export type SupportedKnowledgeExtension = (typeof SUPPORTED_EXTENSIONS)[number]

function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() ?? ''
}

function getBaseTitle(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, '')
}

function normalizeRowValue(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'string') return value.trim()
  return String(value).trim()
}

function rowToText(row: unknown): string {
  if (Array.isArray(row)) {
    return row.map((value) => normalizeRowValue(value)).filter(Boolean).join(' | ')
  }

  if (row && typeof row === 'object') {
    const record = row as Record<string, unknown>
    if (typeof record.content === 'string' && record.content.trim()) {
      return record.content.trim()
    }

    const pairs = Object.entries(record)
      .map(([key, value]) => {
        const normalized = normalizeRowValue(value)
        return normalized ? `${key}: ${normalized}` : ''
      })
      .filter(Boolean)

    return pairs.join('\n')
  }

  return normalizeRowValue(row)
}

function chunkTabularRows(rows: unknown[], titlePrefix: string): ChunkedText[] {
  const chunks: ChunkedText[] = []

  for (let index = 0; index < rows.length; index += 1) {
    const text = rowToText(rows[index])
    if (!text) continue

    const rowTitle = `${titlePrefix} Row ${index + 1}`
    chunks.push(...chunkTextByParagraph(text, { title: rowTitle }))
  }

  return chunks
}

async function parseCsvFile(file: File): Promise<ChunkedText[]> {
  const fileText = await file.text()
  const headerResult = Papa.parse<Record<string, string>>(fileText, {
    header: true,
    skipEmptyLines: true,
  })

  if (headerResult.errors.length > 0 && headerResult.data.length === 0) {
    throw new Error(headerResult.errors[0]?.message ?? 'Failed to parse CSV file')
  }

  const baseTitle = getBaseTitle(file.name)

  if (headerResult.data.length > 0) {
    return chunkTabularRows(headerResult.data, baseTitle)
  }

  const rowsResult = Papa.parse<string[]>(fileText, {
    header: false,
    skipEmptyLines: true,
  })

  return chunkTabularRows(rowsResult.data, baseTitle)
}

async function parseXlsxFile(file: File): Promise<ChunkedText[]> {
  const xlsx = await import('xlsx')
  const buffer = await file.arrayBuffer()
  const workbook = xlsx.read(buffer, { type: 'array' })
  const baseTitle = getBaseTitle(file.name)

  const chunks: ChunkedText[] = []

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName]
    if (!sheet) continue

    const rowObjects = xlsx.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: '',
    })

    if (rowObjects.length > 0) {
      chunks.push(...chunkTabularRows(rowObjects, `${baseTitle} - ${sheetName}`))
      continue
    }

    const csvLike = xlsx.utils.sheet_to_csv(sheet).trim()
    if (!csvLike) continue

    chunks.push(
      ...chunkTextByParagraph(csvLike, {
        title: `${baseTitle} - ${sheetName}`,
      })
    )
  }

  return chunks
}

async function parseDocxFile(file: File): Promise<ChunkedText[]> {
  const mammoth = await import('mammoth/mammoth.browser')
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  const text = result.value?.trim() ?? ''

  if (!text) {
    throw new Error('No readable text found in DOCX file')
  }

  return chunkTextByParagraph(text, {
    title: getBaseTitle(file.name),
  })
}

async function parsePdfFile(file: File): Promise<ChunkedText[]> {
  const pdfjs = await import('pdfjs-dist')
  const arrayBuffer = await file.arrayBuffer()

  const loadingTask = (pdfjs as unknown as {
    getDocument: (source: Record<string, unknown>) => { promise: Promise<unknown> }
  }).getDocument({
    data: new Uint8Array(arrayBuffer),
    disableWorker: true,
    isEvalSupported: false,
    disableFontFace: true,
  })

  const pdfDocument = await loadingTask.promise as {
    numPages: number
    getPage: (pageNumber: number) => Promise<{ getTextContent: () => Promise<{ items: Array<{ str?: string }> }> }>
  }

  const pageTexts: string[] = []

  for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
    const page = await pdfDocument.getPage(pageNumber)
    const textContent = await page.getTextContent()
    const pageText = textContent.items
      .map((item) => item.str ?? '')
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()

    if (pageText) {
      pageTexts.push(pageText)
    }
  }

  const mergedText = pageTexts.join('\n\n').trim()
  if (!mergedText) {
    throw new Error('No readable text found in PDF file')
  }

  return chunkTextByParagraph(mergedText, {
    title: getBaseTitle(file.name),
  })
}

export function getSupportedKnowledgeExtensions(): readonly SupportedKnowledgeExtension[] {
  return SUPPORTED_EXTENSIONS
}

export async function parseKnowledgeFile(file: File): Promise<ChunkedText[]> {
  const extension = getFileExtension(file.name)

  if (!SUPPORTED_EXTENSIONS.includes(extension as SupportedKnowledgeExtension)) {
    throw new Error(`Unsupported file type: .${extension || 'unknown'}`)
  }

  switch (extension) {
    case 'csv':
      return parseCsvFile(file)
    case 'xlsx':
      return parseXlsxFile(file)
    case 'docx':
      return parseDocxFile(file)
    case 'pdf':
      return parsePdfFile(file)
    default:
      throw new Error(`Unsupported file type: .${extension}`)
  }
}
