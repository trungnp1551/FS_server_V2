const app = require('./app')
const http = require('http')
const server = http.createServer(app)
var io = require('socket.io')(server);

const SocketServer = require('./socketServer')
io.on('connection', socket => {
    SocketServer(socket)
})

const PORT = 3000 

server.listen(PORT,()=>{
    console.log('run')
})