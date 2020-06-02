const WebSocket = require('ws')
const fs = require('fs')
const express = require('express')
const formidable = require('formidable')

const app = express()
// app.use(compression())

app.use(express.static(__dirname + '/client'))
app.get("/", (req, res)=>{
  res.readFile(__dirname + "/client")
})

const port = parseInt(process.env.LEANCLOUD_APP_PORT || process.env.PORT || 9737)
app.listen(port, ()=>{
  console.log("port: " + port)
})

app.post('/upload', (req, res) => {
  // js文件上传
  var file = new formidable.IncomingForm()
  file.maxFieldsSize = 2 * 1024 * 1024 //限制为最大2M
  file.keepExtensions = true
  file.multiples = true
  file.parse(req, (err, fields, files) => {
    if (err) {
      console.error('Error', err)
      throw err
    }

    // console.log(files)
    fs.readFile(files.filename.path, 'utf8', function(err,data){
      if(err){console.log(err)}
      wsSerSend(data, {binary:true})
    })
  })
  res.end('js uploaded success!')
})

const paste = {type: 'word'}
const wss = new WebSocket.Server({ port: 8180 })

function wsSerSend(data, option){
  wss.clients.forEach(client=>{
    // if (client !== sws && client.readyState === sws.OPEN) {
      try {
        paste.data = JSON.parse(data).data
      } catch {}
      console.log('send data')
      client.send(data, option)
    // }
  })
}

wss.on('connection', (ws)=>{
  if(paste.data) ws.send(paste)
  gws = ws
  ws.on('message', (data)=>{
    // console.log('send message:', data)
    paste.data = data
    wsSerSend(JSON.stringify(paste))
  })
})