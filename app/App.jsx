import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import io from 'socket.io-client'
import styles from './chat.css'
import FaUser from 'react-icons/lib/fa/user'
import FaComments from 'react-icons/lib/fa/comments'
import FaCommentingO from 'react-icons/lib/fa/commenting-o'


class Chat extends Component{
    constructor(props){
        super(props)
        this.state = {
            messages: [],
            users: [],
            display: false
        }

        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleDisplay = this.handleDisplay.bind(this)
    }


    componentDidMount(){
        this.socket = io('/')

        this.socket.on('connect', () => {
            console.log('connected to server')

            // joining Tunesbook
            // callback function to check if everything is ok so far
            // the callback is send to the server
            this.socket.emit('join', (err) => {
                if (err){
                    alert(err);
                } else {
                    console.log('No error');
                }
            })
        })

        this.socket.on('updateUserList', ( users ) => {
            this.setState({
                users: users
            })
        })

        this.socket.on('message', ( message ) => {
            this.setState({
                messages: [ message, ...this.state.messages ]
            })
        })

        this.socket.on('disconnect', () => {
            console.log('disconnected from server')
        })
    }

    handleSubmit(event){
        const body = event.target.value
        if(event.keyCode === 13 && body){
            const message = {
                body,
                from: 'Me'
            }
            this.setState({
                messages: [ message, ...this.state.messages ]
            })
            this.socket.emit('message', body)
            event.target.value = ''
        }
    }

    handleDisplay(){
        this.setState({
            display: !this.state.display
        }) 
    }

    render(){
        const messages = this.state.messages.map((message, index) => {
            return ( 
                <li key={index}>
                    <b style={{color: '#3377c0'}}>{message.from}</b><span style={{color: '#999',
padding: '0.5rem'}} >{message.createdAt}</span>
                    <div i style={{padding: '0.5rem 0.5rem 0.5rem 0'}}>
                        {message.body}
                    </div>
                </li>
            )   
        })

        const users = this.state.users.map((user, index) => {
            return <li key={index}><b>{user}</b></li>
        })

        console.log("how many user connected", this.state.users.length)
        console.log(this.state.display)
        return(
            <div>
                <Iconbar>
                    <Icon>
                        <FaUser/>
                        <span className={styles.badge}> {this.state.users.length} </span>
                    </Icon>
                    <Icon show={this.handleDisplay}>
                        <FaComments/>
                    </Icon>
                </Iconbar>
                {this.state.display ?
                        (
                            <div className={styles.container}>
                            <div className={styles.messages}>
                                {messages}
                            </div>
                            <div className={styles.footer}>
                                <div className={styles.chatinput}>
                                    <input type='text' placeholder='Enter a message..' onKeyUp={this.handleSubmit}/>
                            </div>
                        </div>
                            </div>
                        ) : null
                }
            </div>
        )
    }
}

const Iconbar = (props) => (<div className={styles.iconbar} {...props}/>)

class Icon extends React.Component{
    constructor(props){
        super(props)

        this.state = {
            open: false
        }

        this.handleClick = this.handleClick.bind(this)
    }

    handleClick(callback){
        this.setState({
            open: !this.state.open
        })
        callback()
    }

    
    render(){
        console.log(this.props)
        return this.state.open ? (
            <div onClick={this.handleClick(this.props.show)} className={styles.open}>
                {this.props.children}
            </div>
        ) : (
            <div onClick={this.handleClick} className={styles.close}>
                {this.props.children}
            </div>
        )
    }
}

ReactDOM.render(
    <Chat/>
    ,
    document.getElementById('app')
) 

