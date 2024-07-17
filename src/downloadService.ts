import axios from 'axios'
import ProgressBar from 'progress'
import fs from 'fs'
import path from 'path'
import { createDirectoryIfNotExists, sanitizeFilename } from './util'

export const downloadFileWithProgressBar = async (
  url: string,
  outputPath: string,
) => {
  try {
    const sanitizedFilename = sanitizeFilename(path.basename(url).split('?')[0])
    const filename: string = path.join(outputPath, sanitizedFilename)

    if (fs.existsSync(filename)) {
      console.log(`File already exists, skip: ${sanitizedFilename}`)
      return filename
    }

    const { data, headers } = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
    })

    createDirectoryIfNotExists(outputPath)

    const totalLength = headers['content-length']
    const progressBar = new ProgressBar(
      '-> downloading [:bar] :percent :etas',
      {
        width: 40,
        complete: '=',
        incomplete: ' ',
        renderThrottle: 1,
        total: parseInt(totalLength, 10),
      },
    )

    const writer = fs.createWriteStream(filename)

    // Handle errors
    const onError = (err) => {
      console.error('Download failed', err)
      // Clean up the writer stream
      writer.close()
      // Delete the partially downloaded file
      if (fs.existsSync(filename)) {
        fs.unlinkSync(filename)
      }
    }

    data.on('data', (chunk: string | any[]) => progressBar.tick(chunk.length))
    data.pipe(writer)

    // Listen for errors on the data stream
    data.on('error', onError)
    // Listen for errors on the writer stream
    writer.on('error', onError)

    // writer.on('finish', () => {
    //   console.log('Download complete')
    // })

    data.on('end', () => {
      console.log(`Finish downloading ${sanitizedFilename}`)
      return filename
    })
  } catch (error) {
    console.error('Error during download:', error)
  }
}
