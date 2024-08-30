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
