/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import MpScoreCard from './MpScoreCard'
import { Link } from 'react-router-dom'
import Scoreboard from './Scoreboard'

function MpTimeUp(props) {
    const [isWinner, setIsWinner] = useState(false)
   
    useEffect(() => {
        const playerScores = props.playerState.map(player => player.state.Score);
        
        const maxScore = playerScores.length > 0 ? Math.max(...playerScores) : 0;
    
        const currentPlayer = props.playerState.find(player => player.player === props.user.username);
        const currentPlayerScore = currentPlayer?.state.Score || 0;
    
        setIsWinner(currentPlayerScore === maxScore);
    
    }, [props.playerState, props.user.username]);

  return (
    <div className='flex flex-col justify-center'>
        <div className='flex justify-center'>
            <img className='' src={isWinner ? "https://em-content.zobj.net/source/apple/354/moai_1f5ff.png" : "https://em-content.zobj.net/source/apple/391/skull_1f480.png"} alt="Skull" />
        </div>
        <div>
            <h1 className='text-black text-[3rem] cursor-default'>
                {
                    isWinner ? "You won!" : "Game over!"
                }
            </h1>
        </div>
        <div className='flex flex-col justify-center'>
            <MpScoreCard points={props.points}/>
            <Scoreboard playerState={props.playerState} user={props.user}/>
        </div>
        <div>
            <Link to='/lobby'>
            <button className='bg-blue-400 border-2 border-b-[12px] border-black rounded-full py-4 px-36 m-4 hover:border-b-2 hover:scale-110 ease-in-out duration-200 hover:bg-blue-600'>
                Restart Game
            </button>
            </Link>
        </div>
    </div>
  )
}

export default MpTimeUp
