import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import {
  saveFile,
  saveFiles,
  isValidFileType,
  isValidFileSize,
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
} from "@/lib/utils/file-upload"

/**
 * POST - Upload file(s)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    // Validate files
    for (const file of files) {
      // Check file type
      if (!isValidFileType(file.type, ALLOWED_IMAGE_TYPES)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.name}. Allowed: JPG, PNG, WEBP, GIF` },
          { status: 400 }
        )
      }

      // Check file size
      if (!isValidFileSize(file.size, MAX_IMAGE_SIZE)) {
        return NextResponse.json(
          { error: `File too large: ${file.name}. Max size: 5MB` },
          { status: 400 }
        )
      }
    }

    // Save files
    const uploadedUrls = await saveFiles(files, "uploads/products")

    return NextResponse.json({
      message: "Files uploaded successfully",
      urls: uploadedUrls,
      count: uploadedUrls.length,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload files" },
      { status: 500 }
    )
  }
}
