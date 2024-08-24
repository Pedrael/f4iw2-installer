import http from 'http'
import cors from 'cors'
import { mainMenu } from './src/ui/mainMenu'

const PORT = 3000

const server = http.createServer((req, res) => {
  // Use the cors middleware
  cors()(req, res, () => {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('Hello, world!\n')
  })
})

server.listen(PORT, () => {
  mainMenu()
})
