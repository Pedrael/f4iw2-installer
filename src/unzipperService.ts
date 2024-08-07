import StreamZip from 'node-stream-zip'
import SevenZip from '7zip-min'
import { createExtractorFromFile } from 'node-unrar-js'
import fs from 'fs'
import path from 'path'
import ProgressBar from 'progress'
import { createDirectoryIfNotExists } from './util'

type UnzipperFunction = (archivePath: string, outputPath: string) => void
type ExtensonsSelect = Record<string, UnzipperFunction>

const useSevenZip = (archivePath: string, outputPath: string) => {
  SevenZip.unpack(archivePath, outputPath, (err) => {
    err
      ? console.error('Error extracting 7z archive:', err)
      : console.log(`Extracted to ${outputPath}`)
  })
}

const useSevenZipWithProgress = (
  archivePath: string,
  outputDirectory: string,
) => {
  createDirectoryIfNotExists(outputDirectory)

  SevenZip.list(archivePath, (err, result) => {
    if (err) {
      console.error('Error listing 7z archive contents:', err)
      return
    }

    const totalEntries = result.length

    const progressBar = new ProgressBar('-> extracting [:bar] :percent :etas', {
      width: 40,
      complete: '=',
      incomplete: ' ',
      total: totalEntries,
    })

    SevenZip.unpack(archivePath, outputDirectory, (err) => {
      if (err) {
        console.error('Error extracting 7z archive:', err)
        return
      }
      console.log(`Extraction complete: ${outputDirectory}`)
    })

    // Simulate progress for 7z extraction (7zip-min does not provide progress events)
    let extractedEntries = 0
    const interval = setInterval(() => {
      if (extractedEntries < totalEntries) {
        extractedEntries += Math.ceil(totalEntries / 100)
        progressBar.tick(Math.ceil(totalEntries / 100))
      } else {
        clearInterval(interval)
      }
    }, 100)
  })
}

const useZip = async (archivePath: string, outputPath: string) => {
  const zip = new StreamZip.async({ file: archivePath })
  try {
    await zip.extract(null, outputPath)
    console.log(`Extracted to ${outputPath}`)
  } catch (err) {
    console.error('Error extracting ZIP archive:', err)
  } finally {
    await zip.close()
  }
}

const useZipWithProgress = async (
  archivePath: string,
  outputDirectory: string,
) => {
  createDirectoryIfNotExists(outputDirectory)

  const zip = new StreamZip.async({ file: archivePath })
  const entries = await zip.entries()
  const totalEntries = Object.keys(entries).length

  const progressBar = new ProgressBar('-> extracting [:bar] :percent :etas', {
    width: 40,
    complete: '=',
    incomplete: ' ',
    total: totalEntries,
  })

  for (const entry of Object.values(entries)) {
    const fullPath = path.join(outputDirectory, entry.name)
    if (entry.isDirectory) {
      createDirectoryIfNotExists(fullPath)
    } else {
      createDirectoryIfNotExists(path.dirname(fullPath))
      await zip.extract(entry.name, fullPath)
    }
    progressBar.tick()
  }

  await zip.close()
  console.log(`Extraction complete: ${outputDirectory}`)
}

const useRar = async (archivePath: string, outputPath: string) => {
  try {
    // Create the extractor with the file information (returns a promise)
    const extractor = await createExtractorFromFile({
      filepath: archivePath,
      targetPath: outputPath,
    })

    // Extract the files
    ;[...extractor.extract().files]
    console.log(`Extracted to ${outputPath}`)
  } catch (err) {
    // May throw UnrarError, see docs
    console.error(err)
  }
}

export const unzipFile = async (archivePath: string, outputPath: string) => {
  const extension = path.extname(archivePath).toLowerCase()

  createDirectoryIfNotExists(outputPath)

  const extensionsSelect: ExtensonsSelect = {
    '.zip': useZipWithProgress,
    '.rar': useRar,
    '.7z': useSevenZipWithProgress,
  }
  try {
    extensionsSelect[extension](archivePath, outputPath)
  } catch (err) {
    console.error('Unsupported archive format:', extension, 'Full info:', err)
  }
}
