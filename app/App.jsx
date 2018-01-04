import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import io from 'socket.io-client'
import 'whatwg-fetch'

import FaUser from 'react-icons/lib/fa/user'
import FaComments from 'react-icons/lib/fa/comments'
import FaCommentingO from 'react-icons/lib/fa/commenting-o'

import FaToggleOff from 'react-icons/lib/fa/toggle-off'
import FaToggleOn from 'react-icons/lib/fa/toggle-on'

import katex from 'katex'

import styles from './app.css'

class App extends Component{
    constructor(props){
        super(props)
        this.state = {
            isLogged: false,
            username: ''
        }

        this.handleLogin = this.handleLogin.bind(this)
    }

    handleLogin(user){
        this.setState((prevState) => {
            return {
                username: user,
                isLogged: !prevState.isLogged
            }
        })
    }

    render() {
        return (
            <div style={this.state.isLogged ? {marginLeft: '-100%'} : {marginLeft: 0}} className={styles.container} >
                <Login handleLogin={this.handleLogin}/>
                {this.state.isLogged ? (
                    <div className={styles.chatContainer}>
                        <Chat username={this.state.username}/>
                    </div>
                ) : (
                    <div className={styles.chatContainer}></div>
                )}
            </div>
        )
    }
}

class Login extends Component{
    constructor(props){
        super(props)
        this.state = {
            username: ''
        }

        this.handleInputChange = this.handleInputChange.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    handleInputChange(event){
        const target = event.target
        const value = target.value
        const name = target.name

        //cool ES6 feature to remember
        this.setState((prevState) => {
            return {
                [name]: value
            }
        })
    }

    handleSubmit(event){
        const body = event.target.value
        if(event.keyCode === 13 && body){
            this.props.handleLogin(this.state.username)
        }
    }

    render(){
        return (
            <div className={styles.loginContainer}>
                <div className={styles.loginCard}>
                    <h3>Messagerie PolyTeX</h3>
                    <input onKeyUp={this.handleSubmit} name="username" onChange={this.handleInputChange} type='text' placeholder='Entrer nom...' />
                    <button onClick={() => this.props.handleLogin(this.state.username)}>Entrer chat</button>
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
            displayMode: true,
            throwOnError: true
        })
        return (<p dangerouslySetInnerHTML={ {__html: math} }/>);
    }
}

class Chat extends Component{
    constructor(props){
        super(props)
        this.state = {
            messages: [],
            latexOutput: '',
            users: [],
            username: props.username,
            latex: false
        }

        this.handleSubmit = this.handleSubmit.bind(this)
        this.updateText = this.updateText.bind(this)
        this.latexToggle = this.latexToggle.bind(this)
    }

    latexToggle(){
        //cool ES6 feature to remember
        this.setState((prevState) => {
            return {
                latex: !prevState.latex
            }
        })
    }

    updateText(event) {
        var nText = event.target.value;
        this.setState(function () {
            return {
                latexOutput: nText
            }
        })
    }

    componentDidMount(){

        fetch('http://alexandre.hassler.fr:3001/discussion')
            .then(res => res.json())
            .then(messages => {
                console.log(messages)
                this.setState({
                    messages:  [...messages]
                })

            })
            .catch(err => console.log(err))


        this.socket = io('http://alexandre.hassler.fr:3001')

        const login_name = this.state.username

        this.socket.on('connect', () => {
            console.log('connected to server')
            this.socket.emit('join',login_name, (err) => {
                if (err){
                    alert(err);
                } else {
                    console.log('No error');
                }
            })
        })

        this.socket.on('newMessage', ( message ) => {
            this.setState({
                messages: [ message, ...this.state.messages ]
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
                from: this.state.username,
                latex: this.state.latex
            }
            this.setState({
                messages: [ message, ...this.state.messages ],
                latexOutput: ''
            })
            this.socket.emit('message', message)
            event.target.value = ''
        }
    }

    render(){
        var latexOutput = this.state.latexOutput

        const messages = this.state.messages.map((message, index) => {
            return ( 
                <li className={styles.message} key={index}>
                    <div className={styles.message__title}>
                        <h4>{message.from}</h4>
                        <span>{message.createdAt}</span>
                    </div>
                    <div className={styles.message__body}>
                        {!message.latex ? 
                            (message.body) : (<MathDisplay data={message.body}/>)}
                    </div>
                </li>
            )   
        })

        const users = this.state.users.map((user, index) => {
            return <li key={index}><b>{user}</b></li>
        })

        return(
            <div className={styles.chat}>
                <Sidebar>
                    <h3>Utilisateurs</h3>
                    <ul>
                        {users}
                    </ul>
                </Sidebar>
                
                <div className={styles.latexOutputContainer}>
                    { this.state.latex ? (<MathDisplay data={latexOutput}/>) : null }
                </div>

                <div className={styles.chat__main}>
                    <ul className={styles.chat__messages}>
                        {messages}
                </ul>
                    <div className={styles.chat__footer}>
                        <div className={styles.chat__footerForm}>
                            <input type='text' placeholder='Enter a message..' onChange={this.updateText}  onKeyUp={this.handleSubmit}/>
                            {this.state.latex ? (
                                <div className={styles.latexToggle} onClick={this.latexToggle}>
                                    <FaToggleOn/> 
                                </div> 
                            ) : (
                                <div className={styles.latexToggle} onClick={this.latexToggle}>
                                    <FaToggleOff/>
                                </div> 
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}


const Iconbar = (props) => (<div className={styles.iconbar} {...props}/>)

const Sidebar = (props) => (<div className={styles.chat__sidebar} {...props}/>)


ReactDOM.render(
    <App/>
    ,
    document.getElementById('app')
) 

