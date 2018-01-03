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
    //new user connected !!
    socket.on('join', (login_name, callback) => {
        
        console.log(`${login_name} is connected`)
        //prevent user from multiple connection
        users.removeUser(socket.id)

        users.addUser(socket.id, login_name)

        socket.emit('username', login_name)

        io.emit('updateUserList',users.getUserList())

        socket.broadcast.emit('message', generateMessage('Admin',users.getUser(socket.id)) + 'a rejoint la salle PolyTeX !')
        callback()
    })
    

    socket.on('message', (message) => {
        var user = users.getUser(socket.id)
        if (user &&  typeof message.body === 'string' && message.body.trim().length > 0){
            console.log(message.body)
            socket.broadcast.emit('message', generateMessage(user.name, message.body, message.latex))
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
