import { useEffect, useState } from 'react'
import io from 'socket.io-client'
import { v4 } from 'uuid'
import './App.css';

const PORT = 3001
const socket = io(`http://localhost:${PORT}`)

function App() {
  const [isConnected, setIsconnected] = useState(socket.connected)
  const [newMessage, setNewMessage] = useState("")
  const [user, setUser] = useState("")
  const [room, setRoom] = useState("")
  const [chatIsVisble, setChatIsVisible] = useState(false)
  const [messages, setMessages] = useState([])
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    socket.on('connect', () => {
      setIsconnected(true)
    })

    socket.on('disconnect', () => {
      setIsconnected(false)
    })

    return () => {
      socket.off('connect');
      socket.off('disconnect')
    }

  }, [isConnected])

  useEffect(() => {
    socket.on("receive_msg", ({ user, message }) => {
      const MsgData = {
        room: room,
        user: user,
        message: message
      }
      setMessages(prevState => ([MsgData, ...prevState]))
    })
  }, [socket])

  const handleEnterChatRoom = () => {

    setHasError(true)

    if (user !== "" && room !== "") {
      setChatIsVisible(true)
      socket.emit("join_room", { user, room })
    }
  }

  const handleEnterChatRoomButton = () => {
    setChatIsVisible(true)
    socket.emit("join_room", { user, room })
  }

  const handleSendMessage = () => {
    if (newMessage !== "") {
      const newMsgData = {
        room: room,
        user: user,
        message: newMessage
      }

      socket.emit("send_msg", newMsgData)
      setMessages(prevState => [newMsgData, ...prevState])
      setNewMessage("")
    }
  }

  return (
    <div className="App">
      {!chatIsVisble ?
        <>
          <input type="text" placeholder='user' value={user} onChange={e => setUser(e.target.value)} />
          <input type="text" placeholder='room' value={room} onChange={e => setRoom(e.target.value)} />

          <br />

          <button onClick={handleEnterChatRoomButton}>Chat Anônimo</button>

          <button onClick={handleEnterChatRoom}>enter</button>

          {hasError && <h3>Não foi possivel entrar</h3>}
        </>
        :
        <>
          <h5> {room ? <>Room: {room}</> : <>Chat Anônimo</>} {user && <>| User: {user}</>}</h5>
          <div className='message'>
            {messages.map(message => (
              <div key={v4()} className="item">
                {message.user ? <span>{message.user}</span> : <span>User Anônimo</span>}
                {message.message && <span>{message.message}</span>}
                <hr />
              </div>
            ))}
          </div>
          <input type="text" placeholder='message' value={newMessage} onChange={e => setNewMessage(e.target.value)} />
          <button onClick={handleSendMessage}>send</button>
        </>
      }
    </div>
  );
}

export default App;
