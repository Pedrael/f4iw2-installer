// Import the http module
import https from 'https'
import { mo2 } from './keys.json'
import { RequestOptions } from 'https'
import { findURIUsingAddress, manualSelectUI } from './manualSelect'
import { CDNAddress, CDNNames } from './types'
import { downloadFileWithProgressBar } from './downloadService'
import { unzipFile } from './unzipperService'

export const aquireDownloadLink = (hostname: string, URL: string) => {
  // Define request options
  const options: RequestOptions = {
    hostname: hostname,
    port: 443,
    path: URL,
    method: 'GET',
    headers: {
      apikey: mo2,
      Connection: 'keep-alive',
      'Content-Type': 'application/json',
    },
  }

  // Make the GET request
  const req = https.request(options, (res) => {
    let data = ''

    res.headers.location
      ? aquireDownloadLink(hostname, res.headers.location)
      : console.log('No "Location" header found.')

    res.on('data', (chunk) => {
      data += chunk
    })

    res.on('end', async () => {
      const { short_name } = await manualSelectUI()
      const filename = findURIUsingAddress(
        JSON.parse(data) as CDNAddress[],
        short_name,
      ).URI
      const filedownloaded = await downloadFileWithProgressBar(
        filename,
        './down',
      )
      await unzipFile(filedownloaded, './unzipped')
    })
  })

  req.on('error', (error) => {
    console.error('Error making request:', error.message)
  })

  req.end() // Send the request
}
