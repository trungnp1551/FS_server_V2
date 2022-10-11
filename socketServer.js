var clients = [];
var requestConnects = []

const SocketServer = (socket) => {

    socket.on('signin', (data) => {
        const { id } = data
        const client = clients.find(client => client.userId == id)
        if (!client) {
            clients.push({
                userId: id,
                socketId: socket.id
            })
            console.log('clients: ')
            console.log(clients)
        }
    })

    socket.on('start-connect', async (data) => {
        const { id } = data
        const client = clients.find(client => client.userId == id)
        const temp = requestConnects.find(tempClient => tempClient.userId == client.userId)
        if (!temp) {
            console.log('add to request connects')
            requestConnects.push(client)

            if (requestConnects.length >= 2) {
                // var source = requestConnects.splice(0, 1);
                // var target = requestConnects.splice(0, 1);
                // console.log(source);
                // console.log(target);
                // socket.to(`${source.socketId}`).emit('to-conversation', target.userId)
                // socket.to(`${target.socketId}`).emit('to-conversation', source.userId)
            }

            console.log('requestConnects: ')
            console.log(requestConnects) 
        }

    })

    socket.on('stop-connect', async (data) => {
        const { id } = data
        const client = clients.find(user => user.userId == id)
        requestConnects.splice(requestConnects.indexOf(client), 1);
        console.log(requestConnects)
    })

    socket.on('message', async (data) => {
        const { id, targetId, content, isImage } = data
        const target = clients.find(client => client.userId == targetId)
        socket.to(`${target.socketId}`).emit('message', ({ id, content, isImage }))
    })

    socket.on('disconnect', async () => {
        console.log(socket.id)
        const temp = requestConnects.find(rc => rc.socketId = socket.id) //error
        console.log(temp.socketId)
        if (temp == undefined) {
            console.log('xoa requestConnects')
            requestConnects.splice(requestConnects.indexOf(temp), 1)
        }
        //const target = await clients.find(client => client.socketId == socket.id)
        //clients.splice(clients.indexOf(target), 1);
        console.log('clients: ')
        console.log(clients)
        console.log('---------------')
        console.log('requestConnects: ')
        console.log(requestConnects)

    })
}

module.exports = SocketServer