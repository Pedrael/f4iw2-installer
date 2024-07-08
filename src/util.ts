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
