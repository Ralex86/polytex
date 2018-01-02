import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import io from 'socket.io-client'
import FaUser from 'react-icons/lib/fa/user'
import FaComments from 'react-icons/lib/fa/comments'
import FaCommentingO from 'react-icons/lib/fa/commenting-o'

import katex from 'katex'

//import styles from './chat.css'
import styles from './app.css'

class Chat extends Component{
    constructor(props){
        super(props)
        this.state = {
            messages: [],
            message: '',
            users: [],
            username: ""
        }

        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleDisplay = this.handleDisplay.bind(this)
        this.updateText = this.updateText.bind(this)
    }

    updateText(event) {
        var nText = event.target.value;
        this.setState(function () {
            return {message: nText}
            })
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
        var message = this.state.message

        const messages = this.state.messages.map((message, index) => {
            return ( 
                <li className={styles.message} key={index}>
                    <div className={styles.message__title}>
                        <h4>{message.from}</h4>
                        <span>{message.createdAt}</span>
                    </div>
                    <div className={styles.message__body}>
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
            <div className={styles.chat}>
                <Sidebar>
                    <h3>Utilisateurs</h3>
                    <ul>
                        {users}
                    </ul>
                </Sidebar>

                <div className={styles.chat__main}>
                    <ul className={styles.chat__messages}>
                        { this.state.message.length > 0 ? (<MathDisplay data={message}/>) : null }
                        {messages}
                </ul>
                    <div className={styles.chat__footer}>
                        <div className={styles.chat__footerForm}>
                            <input type='text' placeholder='Enter a message..' onChange={this.updateText}  onKeyUp={this.handleSubmit}/>
                            <button>Envoyer</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

class MathDisplay extends React.Component{
    constructor(props) {
        super(props)
      }

    render() {
        var math = katex.renderToString(this.props.data,{
          displayMode: true})
        return (<p dangerouslySetInnerHTML={ {__html: math} }/>);
    }
}

const Iconbar = (props) => (<div className={styles.iconbar} {...props}/>)

const Sidebar = (props) => (<div className={styles.chat__sidebar} {...props}/>)
//const Users = (props) => (<div className={styles.chat__sidebar} {...props}/>)

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

