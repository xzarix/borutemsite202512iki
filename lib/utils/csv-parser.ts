/**
 * CSV Parser Utilities for Bulk Orders
 */

export interface CSVRow {
  [key: string]: string
}

/**
 * Parse CSV string to array of objects
 */
export function parseCSV(csvContent: string): CSVRow[] {
  const lines = csvContent.trim().split("\n")

  if (lines.length < 2) {
    throw new Error("CSV must have at least a header row and one data row")
  }

  // Parse header
  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

  // Parse rows
  const rows: CSVRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue // Skip empty lines

    const values = line.split(",").map((v) => v.trim().replace(/"/g, ""))

    if (values.length !== headers.length) {
      throw new Error(`Line ${i + 1} has invalid number of columns`)
    }

    const row: CSVRow = {}
    headers.forEach((header, index) => {
      row[header] = values[index]
    })

    rows.push(row)
  }

  return rows
}

/**
 * Validate bulk order CSV format
 */
export interface BulkOrderItem {
  productCode: string
  quantity: number
  notes?: string
}

export interface BulkOrderValidationResult {
  valid: boolean
  items: BulkOrderItem[]
  errors: string[]
}

export function validateBulkOrderCSV(csvContent: string): BulkOrderValidationResult {
  const errors: string[] = []
  const items: BulkOrderItem[] = []

  try {
    const rows = parseCSV(csvContent)

    // Check required columns
    const requiredColumns = ["productCode", "quantity"]
    const firstRow = rows[0]

    for (const col of requiredColumns) {
      if (!(col in firstRow)) {
        errors.push(`Missing required column: ${col}`)
      }
    }

    if (errors.length > 0) {
      return { valid: false, items: [], errors }
    }

    // Validate each row
    rows.forEach((row, index) => {
      const lineNumber = index + 2 // +2 because index is 0-based and we have header

      const productCode = row.productCode?.trim()
      const quantityStr = row.quantity?.trim()
      const notes = row.notes?.trim()

      // Validate product code
      if (!productCode) {
        errors.push(`Line ${lineNumber}: Product code is required`)
        return
      }

      // Validate quantity
      const quantity = parseInt(quantityStr)
      if (isNaN(quantity) || quantity < 1) {
        errors.push(`Line ${lineNumber}: Quantity must be a positive number`)
        return
      }

      items.push({
        productCode,
        quantity,
        notes,
      })
    })

    return {
      valid: errors.length === 0,
      items,
      errors,
    }
  } catch (error: any) {
    errors.push(error.message || "Invalid CSV format")
    return { valid: false, items: [], errors }
  }
}

/**
 * Generate sample CSV template
 */
export function generateBulkOrderTemplate(): string {
  const header = "productCode,quantity,notes"
  const examples = [
    'PROD-001,100,"Acil ihtiyaç"',
    'PROD-002,50,""',
    'PROD-003,200,"Büyük proje için"',
  ]

  return [header, ...examples].join("\n")
}

/**
 * Convert array of objects to CSV string
 */
export function arrayToCSV<T extends Record<string, any>>(data: T[]): string {
  if (data.length === 0) return ""

  const headers = Object.keys(data[0])
  const headerRow = headers.map((h) => `"${h}"`).join(",")

  const dataRows = data.map((row) => {
    return headers
      .map((header) => {
        const value = row[header]
        const stringValue = value === null || value === undefined ? "" : String(value)
        return `"${stringValue.replace(/"/g, '""')}"`
      })
      .join(",")
  })

  return [headerRow, ...dataRows].join("\n")
}
