import path from 'path'
import { getArchiveNames, getFilenameWithoutExtension } from '../../util'
import { unzipFile } from './unzipSingleArchive'

export const unzipArchivesList = async (
  directoryPath: string,
  outputPath: string,
) => {
  const archivesList = await getArchiveNames(directoryPath)
  console.log('Start unzipping...', archivesList)
  for (let archiveName of archivesList) {
    await unzipFile(
      path.join(directoryPath, archiveName),
      path.join(outputPath, await getFilenameWithoutExtension(archiveName)),
    )
  }
}
