import React, { useContext, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom';
import useWebSocket from 'react-use-websocket'
import { AuthContext } from '../../context/AuthContext'


const socketURL = import.meta.env.VITE_SOCKET_URL;

function Room() {
    const [searchParams] = useSearchParams();
    const { roomID } = searchParams.get('roomID');
    const [players, setPlayers] = useState([])
    const [host, setHost] = useState(false);
    const { user } = useContext(AuthContext)

    const {sendMessage, lastMessage} = useWebSocket(`${socketURL}/ws/${roomID}/${user.username}`, {
        onOpen: () => {console.log("Connected to WebSocket")},
        onClose: () => {console.log("Disconnected from WebSocket")}
    })

    useEffect(() => {
        console.log(`${socketURL}/ws/${roomID}/${user.username}`)
        if (lastMessage !== null) {
            const message = JSON.parse(lastMessage.data);
            switch(message.action) {
                case "waiting_for_players":
                    // update player list
                    break
                case "player":
                    setPlayers(prev => [...prev, message.username])
                    break
                case "game_started":
                    // Redirect to game
                    break;
                default:
                    break
            }
        }
    }, [lastMessage])

    function handleStartGame() {
        sendMessage(JSON.stringify({action: "start_game"}))
    }

  return (
    <div>
      <h1>Lobby</h1>
      <ul>
        {
            players.map(player => (
                <li key={player.id}>{player.name}</li>
            ))
        }
      </ul>
      {
        host && (
            <button onClick={handleStartGame}>
                Start Game
            </button>
        )
      }
    </div>
  )
}

export default Room
