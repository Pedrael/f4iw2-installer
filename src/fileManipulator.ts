import fs from 'fs-extra'
import path from 'path'
import { createDirectoryIfNotExists } from './util'

const configPath = path.join(__dirname, 'config/loadorder.json')

export enum FileActionsList {
  move = 'MOVE',
  delete = 'DELETE',
  copy = 'COPY',
  copySequentially = 'COPYSEQUENTIALLY',
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

const copyFilesWithOverwrite: ActionFunction = async (
  sourcePath,
  destinationPath,
) => {
  try {
    const files = await fs.readdir(sourcePath)

    for (const file of files) {
      const sourceFilePath = path.join(sourcePath, file)
      const destinationFilePath = path.join(destinationPath, file)

      const sourceStat = await fs.stat(sourceFilePath)
      await fs.copy(sourceFilePath, destinationFilePath, { overwrite: true })
      console.log(`Copied file: ${sourceFilePath} to ${destinationFilePath}`)
    }
    return true
  } catch (err) {
    console.error('Error copying files:', err)
    return false
  }
}

const copyDirectoriesSequentially: ActionFunction = async (
  sourceBasePath,
  destinationDir,
) => {
  try {
    const config = await fs.readJson(configPath)

    await fs.ensureDir(destinationDir)

    for (const folderName of config.order) {
      const sourceDir = path.join(sourceBasePath, folderName)
      console.log(`Starting to copy from ${folderName}...`)
      await copyFilesWithOverwrite(sourceDir, destinationDir)
      console.log(`Finished copying from ${folderName}`)
    }
    console.log('All folders have been copied successfully.')
    return true
  } catch (err) {
    console.error('Error processing configuration or copying folders:', err)
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
    [FileActionsList.copy]: copyFilesWithOverwrite,
    [FileActionsList.copySequentially]: copyDirectoriesSequentially,
    [FileActionsList.delete]: deleteDirectory,
    [FileActionsList.move]: moveDirectory,
  }
  return fileActions[action](sourcePath, destinationPath)
}
