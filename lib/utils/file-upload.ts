/**
 * File Upload Utilities
 */

import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

// Allowed file types
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]

export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
]

// Max file sizes
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024 // 10MB

/**
 * Validate file type
 */
export function isValidFileType(
  mimeType: string,
  allowedTypes: string[]
): boolean {
  return allowedTypes.includes(mimeType)
}

/**
 * Validate file size
 */
export function isValidFileSize(size: number, maxSize: number): boolean {
  return size <= maxSize
}

/**
 * Generate unique filename
 */
export function generateUniqueFilename(originalName: string): string {
  const extension = originalName.split(".").pop()
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 10)
  return `${timestamp}-${random}.${extension}`
}

/**
 * Save file to disk
 */
export async function saveFile(
  file: File,
  directory: string = "uploads"
): Promise<string> {
  try {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), "public", directory)
    await mkdir(uploadDir, { recursive: true })

    // Generate unique filename
    const filename = generateUniqueFilename(file.name)
    const filepath = join(uploadDir, filename)

    // Save file
    await writeFile(filepath, buffer)

    // Return public URL
    return `/${directory}/${filename}`
  } catch (error) {
    console.error("File save error:", error)
    throw new Error("Failed to save file")
  }
}

/**
 * Save multiple files
 */
export async function saveFiles(
  files: File[],
  directory: string = "uploads"
): Promise<string[]> {
  const uploadPromises = files.map((file) => saveFile(file, directory))
  return Promise.all(uploadPromises)
}

/**
 * Delete file from disk
 */
export async function deleteFile(filepath: string): Promise<void> {
  try {
    const { unlink } = await import("fs/promises")
    const fullPath = join(process.cwd(), "public", filepath)
    await unlink(fullPath)
  } catch (error) {
    console.error("File deletion error:", error)
    // Don't throw - file might not exist
  }
}

/**
 * Get file extension
 */
export function getFileExtension(filename: string): string {
  return filename.split(".").pop() || ""
}

/**
 * Get file mime type from extension
 */
export function getMimeTypeFromExtension(extension: string): string {
  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    csv: "text/csv",
  }

  return mimeTypes[extension.toLowerCase()] || "application/octet-stream"
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}
