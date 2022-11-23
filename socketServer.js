var clients = [];
var userOnConnects = []
const status = {
    online: 'Online',
    onConnect: 'OnConnect',
    busy: 'Busy',
};
//var status = ['online', 'onConnect', 'busy', 'offline']

//client {id, socketid, targetCall?, status}

// const EditClients (data, id, targetCallId, status) {
//     const newData = data.map(item =>
//         item.userId == id ? { ...item, targetCallId, status } : item
//     )
//     return newData;
// }


const SocketServer = (socket, io) => {

    socket.on('signin', async (data) => {
        const id = data
        const client = await clients.find(client => client.userId == id)
        if (!client) {
            clients.push({
                userId: id,
                socketId: socket.id,
                status: status.online,
                targetCallId: null
            })
            console.log('clients: ')
            console.log(clients)
        }
    })

    // socket.on('test',(data) => {
    //     const {roomId} = data
    //     io.to(roomId).emit('test','test')
    // })

    // socket.on('join-room',(data) => {
    //     const {roomId} = data
    //     socket.join(roomId)
    //     console.log('join-room' + roomId)
    // })

    // socket.on('editClients', (data) => {
    //     const { targetId } = data
    //     const client = clients.find(client => client.socketId == socket.id)
    //     const target = clients.find(client => client.userId == targetId)
    //     console.log('clients: ')
    //     console.log(clients)
    //     if (target) {
    //         console.log('edit: ')
    //         clients = EditClients(clients, client.userId, target.userId, status.onConnect)
    //     }
    //     console.log('--------------clients: ')
    //     console.log(clients)

    // })

    socket.on('start-connect', async () => {

        const client = await clients.find(client => client.socketId == socket.id)
        const check = userOnConnects.includes(client)

        if (userOnConnects.length != 0 && !check && client.status == status.online) {
            var target = userOnConnects.splice(0, 1)[0];
            io.to(`${client.socketId}`).emit('to-conversation', target.userId)
            io.to(`${target.socketId}`).emit('to-conversation', client.userId)
            client.status = status.busy
            target.status = status.busy
            client.targetCallId = target.userId
            target.targetCallId = client.userId
            console.log(client);
            console.log(target);

            // console.log(userOnConnects)
            return;
        }

        if (!check && client.status == status.online) {
            console.log('add to userOnConnects ' + client.userId)
            client.status = status.onConnect
            userOnConnects.push(client)
        } else {
            console.log('don\'t add to userOnConnects')
        }
        // console.log('clients')
        // console.log(clients)

        // console.log('userOnConnects')
        // console.log(userOnConnects)

    })

    socket.on('stop-connect', async () => {
        const client = await clients.find(user => user.socketId == socket.id)
        if (client.status == status.onConnect) {
            client.status = status.online
            userOnConnects.splice(userOnConnects.indexOf(client), 1);
            console.log('stop connect')
        }
    })

    socket.on('message', async (data) => {
        const sender = await clients.find(client => client.socketId == socket.id)
        const target = await clients.find(client => client.userId == sender.targetCallId)
        io.to(`${target.socketId}`).to(`${socket.id}`).emit('message', ({ ...data, senderId: sender.userId }))
    })

////////////-- disconnect --//////////////

    socket.on('disconnect-conversation', async () => {
        //const {targetId} = data
        const client = await clients.find(client => client.socketId == socket.id)
        const targetId = client.targetCallId
        const target = await clients.find(client => client.userId == targetId)
        socket.to(`${target.socketId}`).emit('disconnect-conversation')
        client.targetCallId = target.targetCallId = null
        target.status = client.status = status.online
        console.log(clients)
    })

    socket.on('logout', async () => {
        const client = await clients.find(client => client.socketId == socket.id)
        if (!client) {
            return;
        }
        if(client.status == status.onConnect){
            userOnConnects.splice(userOnConnects.indexOf(client), 1)
        }
        clients.splice(clients.indexOf(client), 1);
        console.log(clients)
        console.log('logout socket')

    })

    socket.on('disconnect', async () => {
        const client = await clients.find(client => client.socketId == socket.id)
        if (!client) {
            console.log('disconnect')
            return;
        }
        const targetId = client.targetCallId
        if (targetId) {
            console.log('disconnect-conversation')
            const target = await clients.find(item => item.userId == targetId)
            socket.to(`${target.socketId}`).emit('disconnect-conversation')
            client.targetCallId = target.targetCallId = null
            target.status = client.status = status.online
        }

        if (userOnConnects.includes(client)) {
            userOnConnects.splice(userOnConnects.indexOf(client), 1)
        }

        clients.splice(clients.indexOf(client), 1);
        console.log(clients)
        console.log('disconnect')
    })
}

module.exports = SocketServer