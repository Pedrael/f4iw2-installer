import fs from 'fs-extra'
import path from 'path'
import { createDirectoryIfNotExists } from './util'

export enum FileActionsList {
  move = 'MOVE',
  delete = 'DELETE',
  copy = 'COPY',
}

type ActionFunction = (
  sourcePath: string,
  destinationPath?: string,
) => Promise<boolean>
type FileActions = Record<FileActionsList, ActionFunction>

const copyDirectory: ActionFunction = async (sourcePath, destinationPath) => {
  try {
    await fs.ensureDir(destinationPath)
    await fs.copy(sourcePath, destinationPath, { overwrite: true })
    console.log(`Copied directory from ${sourcePath} to ${destinationPath}`)
    return true
  } catch (err) {
    console.error('Error copying directory:', err)
    return false
  }
}

const moveDirectory: ActionFunction = async (sourcePath, destinationPath) => {
  try {
    // Ensure the destination directory exists
    await fs.ensureDir(destinationPath)

    // Move the source directory to the destination
    await fs.move(sourcePath, destinationPath, { overwrite: true })

    console.log(`Moved directory from ${sourcePath} to ${destinationPath}`)
    return true
  } catch (err) {
    console.error('Error moving directory:', err)
    return false
  }
}

const deleteDirectory: ActionFunction = async (directoryPath) => {
  try {
    await fs.remove(directoryPath)
    console.log(`Removed directory: ${directoryPath}`)
    return true
  } catch (err) {
    console.error('Error removing directory:', err)
    return false
  }
}

export const executeFileManipulation = (
  action: FileActionsList,
  sourcePath: string,
  destinationPath?: string,
) => {
  destinationPath && createDirectoryIfNotExists(destinationPath)
  const fileActions = {
    [FileActionsList.copy]: copyDirectory,
    [FileActionsList.delete]: deleteDirectory,
    [FileActionsList.move]: moveDirectory,
  }
  return fileActions[action](sourcePath, destinationPath)
}
