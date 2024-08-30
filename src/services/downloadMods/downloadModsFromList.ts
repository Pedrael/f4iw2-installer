// Import the http module
import https from 'https'
import { mo2 } from '../../config/keys.json'
import { domain_name, mods_list } from '../../config/downloadList.json'
import { RequestOptions } from 'https'
import { CDNAddress, CDNNames, ModsList } from '../../types'
import { downloadFileWithProgressBar } from './downloadSingleMod'
import { createDownloadLinks } from '../../util'
const hostname = 'api.nexusmods.com'

const findURIUsingAddress = (addresses: CDNAddress[], city: CDNNames) =>
  addresses.find((address: CDNAddress) => address.short_name === city)

export const downloadModsFromList = async (city: CDNNames) => {
  // Define request options

  const linksList = createDownloadLinks({ domain_name, mods_list })

  for (let link of linksList) {
    const options: RequestOptions = {
      hostname: hostname,
      port: 443,
      path: link,
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

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', async () => {
        const filename = findURIUsingAddress(
          JSON.parse(data) as CDNAddress[],
          city,
        ).URI
        await downloadFileWithProgressBar(filename, './downloaded')
      })
    })

    req.on('error', (error) => {
      console.error('Error making request:', error.message)
    })

    req.end() // Send the request
  }
}
