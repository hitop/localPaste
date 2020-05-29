const WebSocket = require('ws')
const express = require('express')

const app = express()

app.use(express.static(__dirname + '/client'))

app.get("/", (req, res)=>{
  res.readFile(__dirname + "/client")
})

const port = parseInt(process.env.LEANCLOUD_APP_PORT || process.env.PORT || 9737)
app.listen(port, ()=>{
  console.log("port: " + port)
})

let paste = ""
const wss = new WebSocket.Server({ port: 8180 })

wss.on('connection', (ws)=>{
  ws.send(paste)
  ws.on('message', (data)=>{
    // console.log('send message:', data)
    wss.clients.forEach(client=>{
      if (client !== ws && client.readyState === ws.OPEN) {
        paste = data
        client.send(paste)
      }
    })
  })
})