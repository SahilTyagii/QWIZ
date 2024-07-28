import React, { useContext, useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom';
import useWebSocket from 'react-use-websocket'
import { AuthContext } from '../../context/AuthContext'
import Pattern from '../Pattern';
import ThreeSec from './ThreeSec';
import MpQuestion from './MpQuestion';


const socketURL = import.meta.env.VITE_SOCKET_URL;

function Room() {
    const [searchParams] = useSearchParams();
    const roomID = searchParams.get('roomID');
    const [players, setPlayers] = useState([])
    const [isHost, setIsHost] = useState(false);
    const [host, setHost] = useState("")
    const [gameStarted, setGameStarted] = useState(false)
    const [questions, setQuestions] = useState([])
    const [remainingTime, setRemainingTime] = useState(3)
    const [showQuestion, setShowQuestion] = useState(false)
    const { user } = useContext(AuthContext)
    const roomIDRef = useRef(null)
    const [playerState, setPlayerState] = useState([])

    const {sendMessage, lastMessage} = useWebSocket(`${socketURL}/ws/${roomID}/${user.username}/${user.avatar}`, {
        onOpen: () => {
            console.log("Connected to WebSocket")
        },
        onClose: () => {
            console.log("Disconnected from WebSocket")
        }
    })

    const copyRoomIDToClipboard = () => {
        roomIDRef.current?.select()
        window.navigator.clipboard.writeText(roomID)
    }

    const correctAns = (correct) => {
        const msg = JSON.stringify({
            "action": correct ? "correct_answer" : "wrong_answer",
        })
        sendMessage(msg)
    }
    
    useEffect(() => {
        console.log(`${socketURL}/ws/${roomID}/${user.username}`)
        console.log(`roomID: ${roomID}`)
        if (lastMessage !== null) {
            const message = JSON.parse(lastMessage.data);
            console.log("Received message:", message);
            switch(message.action) {
                case "waiting_for_players":
                    // update player list
                    break
                case "player_joined":
                    setPlayers(message.data.clients)
                    console.log(`Players: ${players}`)
                    break
                case "set_host":
                    setHost(message.data.host)
                    setIsHost(message.data.host === user.username)
                    break
                case "initial_question":
                    setGameStarted(true)
                    setQuestions(message.data)
                    break;
                case "player_state":
                    updatePlayerState(message.data)
                    break
                default:
                    break
            }
        }
    }, [lastMessage, roomID])

    function updatePlayerState(newPlayerState) {
        setPlayerState(prevStates => {
            const updatedStates = prevStates.filter(player => player.player !== newPlayerState.player);
            const newStates = [...updatedStates, newPlayerState];
            return newStates.sort((a, b) => b.state.score - a.state.score)
        });
    }

    function handleStartGame() {
        sendMessage(JSON.stringify({action: "start_game"}))
        console.log('Message sent: {action: "start_game"}')
    }

    useEffect(() => {
        if (gameStarted) {
            const cleanup = startThreeSec();
            return cleanup;
        }
    }, [gameStarted]);
    
    function startThreeSec() {
        const intervalId = setInterval(() => {
            setRemainingTime(prevTime => {
                if (prevTime <= 0) {
                    clearInterval(intervalId);
                    setShowQuestion(true);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);
    
        return () => clearInterval(intervalId);
    }

  return (
    <div>
        {
            gameStarted ? (
                <div>
                    {showQuestion ? (
                        <MpQuestion questions={questions} correctAns={correctAns} playerState={playerState} user={user}/>
                    ) : (
                        <ThreeSec remainingTime = {remainingTime} />
                    )}
                </div>
            ) : (
                <div className='flex justify-center items-center md:p-12 p-4'>

                
                <div className='bg-[#ECDDD9] flex flex-col justify-center lg:w-1/4 w-[98%] rounded-xl border-2 border-slate-700 p-1 or-shadow z-10'>
                    <div className="m-6">
                        <h1 className="text-slate-700 text-4xl cursor-default">Lobby</h1>
                    </div>
                    <div className='flex'>
                        <label htmlFor="roomID" className='text-left text-lg text-black p-2'>Room ID</label>
                    </div>
                    <div className='rounded-md overflow-hidden flex border-slate-700 border-2 border-dashed focus:border-solid focus:outline-none or-shadow mx-2 mb-2'>
                        <input type="text" name="roomID" id="roomID" value={roomID} readOnly className='text-lg bg-white p-2 or-shadow text-gray-700 font-mono' ref={roomIDRef} onClick={copyRoomIDToClipboard}/>
                        <button className='bg-[#DE5399] or-shadow w-full h-12 text-black text-lg hover:bg-[#883c62] border-l-2 border-slate-700 border-dashed focus:border-solid focus:outline-none p-2' onClick={copyRoomIDToClipboard}>Copy</button>
                    </div>
                    <div className='my-2'>
                        <p className='text-black text-2xl cursor-default'>Players joined</p>
                        <ul className='bg-white/60 flex flex-col p-2 m-2 rounded-md backdrop-blur-xl'>
                            {
                                players.map((player, index) => (
                                    <li key={index} className='flex m-2 text-slate-700 text-2xl p-2 border-slate-700 border-2 border-dashed rounded-md bg-white'>
                                        <img className='size-14' src={`avatars/${player.avatar}.png`} alt="" />
                                        <p className='my-auto mx-auto flex cursor-default'>
                                            {player.username}
                                            {player.username === host && (
                                                <img src="https://em-content.zobj.net/source/apple/354/crown_1f451.png" alt="host" className='size-7 ml-2'/>
                                            )}
                                        </p>
                                        
                                    </li>
                                ))
                            }
                        </ul>
                    </div>
                    {
                        isHost && (
                            <div className='px-2 pb-2'>
                                <button onClick={handleStartGame} className='bg-[#DE5399] border-slate-700 border-2 w-full or-shadow rounded-md h-12 text-black text-lg hover:bg-[#883c62]'>
                                    Start Game
                                </button>
                            </div>
                            
                        )
                    }
                    </div>
                </div>
            )
        }
        <Pattern />
    </div>
  )
}

export default Room
