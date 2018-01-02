const express = require('express')
const http = require('http')
const socketIO = require('socket.io')
const fetch = require('node-fetch')

const {Users} = require('./utils/users.js')
const {generateMessage} = require('./utils/message.js')

const app = express()
const PORT = 3001
const server = http.createServer(app)
const io = socketIO(server)

var users = new Users()

app.use(express.static('public'))

io.on('connection', ( socket ) => {
    // new user connected !!
    socket.on('join', (callback) => {
        //prevent user from multiple connection
        users.removeUser(socket.id)

        // the randomize irish name is async...
        let randId = Math.floor(Math.random() * (1686)) + 1
        console.log("rand", randId)
        fetch(`http://alexandre.hassler.fr:3000/name?id=${randId}`)
            .then(res => res.json())
            .then(res => {
                console.log(res)
                users.addUser(socket.id, res[0].name) // here you set up the random name
            })
            .then(() => {
                io.emit('updateUserList',users.getUserList())
                socket.broadcast.emit('newMessage', generateMessage('Admin',users.getUser(socket.id)) + 'joins Tunesbook !')
            })
            .catch(err => console.log(err))

        callback()
    })


    socket.on('message', (body) => {
        var user = users.getUser(socket.id)
        if (user &&  typeof body === 'string' && body.trim().length > 0){
            socket.broadcast.emit('message', generateMessage(user.name, body))
        }

    })

    socket.on('disconnect', () => {
        var user = users.removeUser(socket.id)

        if (user){
            socket.broadcast.emit('updateUserList', users.getUserList())
            socket.broadcast.emit('newMessage', generateMessage('Admin', users.getUser(socket.id)) + 'left Tunesbook !')
        }
    
    })
})


server.listen(PORT, () => {
    console.log(`express server is up on port: ${PORT}`)
})
