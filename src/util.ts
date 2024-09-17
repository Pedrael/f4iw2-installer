import { readFileSync } from 'fs'
import { ModsList } from './types'

export const sanitizeFilename = (filename: string) => {
  return filename.replace(/[^a-zA-Z0-9.]/g, '_')
}

export const createDirectoryIfNotExists = async (directory: string) => {
  const fs = await import('fs')
  if (!fs.existsSync(directory)) {
    console.log(`Directory ${directory} doesn't exict, creating...`)
    fs.mkdirSync(directory, { recursive: true })
  }
}

export const getFilenameWithoutExtension = async (filePath: string) => {
  const path = await import('path')
  return path.parse(filePath).name
}

export const createDownloadLinks = ({
  domain_name,
  mods_list,
}: ModsList): string[] =>
  mods_list.map(
    (mod) =>
      `/v1/games/${domain_name}/mods/${mod.mod_id}/files/${mod.id}/download_link.json`,
  )

export const getArchiveNames = async (
  directoryPath: string,
): Promise<string[]> => {
  try {
    const fs = await import('fs')
    return fs.readdirSync(directoryPath)
  } catch (error) {
    console.error('Error reading directory:', error)
    return []
  }
}

export const findFomodFolders = async (
  directoryPath: string,
): Promise<string[]> => {
  const fomodPaths: string[] = []

  const fs = await import('fs')
  const path = await import('path')

  const searchDirectory = (currentPath: string): void => {
    const files = fs.readdirSync(currentPath)

    for (const file of files) {
      const fullPath = path.join(currentPath, file)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory()) {
        if (file.toLowerCase() === 'fomod') {
          fomodPaths.push(fullPath)
        } else {
          searchDirectory(fullPath) // Recursively search subdirectories
        }
      }
    }
  }

  searchDirectory(directoryPath)

  return fomodPaths
}

export const detectBOM = (filePath: string): string => {
  const buffer = readFileSync(filePath)
  const BOMChars = {
    utf16be: buffer[0] === 0xfe && buffer[1] === 0xff,
    utf16le: buffer[0] === 0xff && buffer[1] === 0xfe,
    utf8: buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf,
  }

  // Find the first key with a `true` value
  const detectedEncoding = Object.keys(BOMChars).find((key) => BOMChars[key])

  // Return the detected encoding or 'unknown' if none matched
  return detectedEncoding || 'unknown'
}
