const express = require('express')
const http = require('http')
const socketIO = require('socket.io')
const fetch = require('node-fetch')

const {Users} = require('./utils/users.js')
const {generateMessage} = require('./utils/message.js')
const Handle = require('./handler.js')

const app = express()
var bodyParser = require("body-parser"); // Body parser for fetch posted data

const PORT = 3001


const server = http.createServer(app)
const io = socketIO(server)

// solve cross origin security
var users = new Users()

app.use(function(req, res, next) {
    var oneof = false
    if(req.headers.origin) {
        res.header('Access-Control-Allow-Origin', req.headers.origin)
        oneof = true
    }
    if(req.headers['access-control-request-method']) {
        res.header('Access-Control-Allow-Methods', req.headers['access-control-request-method'])
        oneof = true
    }
    if(req.headers['access-control-request-headers']) {
        res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers'])
        oneof = true
    }
    if(oneof) {
        res.header('Access-Control-Max-Age', 60 * 60 * 24 * 365)
    }

    // intercept OPTIONS method
    if (oneof && req.method == 'OPTIONS') {
        res.sendStatus(200)
    }
    else {
        next()
    }
})
app.use(express.static('public'))


app.use(bodyParser.urlencoded({ extended: true })); 
app.use(bodyParser.json()); // Body parser use JSON data

app.get('/discussion', (req,res) => {
    let h = new Handle(req,res)
    h.database_discussion()
})



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

            let h = new Handle()
            h.database_submit_message(message.from,message.body,message.latex)

            socket.broadcast.emit('message', generateMessage(user.name, message.body, message.latex))
        }

    })

    socket.on('disconnect', () => {
        var user = users.removeUser(socket.id)

        if (user){
            socket.broadcast.emit('updateUserList', users.getUserList())
            socket.broadcast.emit('newMessage', generateMessage('Admin', users.getUser(socket.id)) + 'left PolyTeX !')
        }
    
    })
})


server.listen(PORT, () => {
    console.log(`express server is up on port: ${PORT}`)
})
