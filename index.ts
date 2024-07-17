import http from 'http'
import cors from 'cors'
import { aquireDownloadLink } from './src/connect'

const PORT = 3000
const game_domain_name = 'fallout4'
const mod_id = '22431' // id from mod`s href above
const id = '305057' // file id (mod can have several files)

const server = http.createServer((req, res) => {
  // Use the cors middleware
  cors()(req, res, () => {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('Hello, world!\n')
  })
})

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
  aquireDownloadLink(
    'api.nexusmods.com',
    `/v1/games/${game_domain_name}/mods/${mod_id}/files/${id}/download_link.json`,
  )
})
