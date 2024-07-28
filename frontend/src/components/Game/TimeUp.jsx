/* eslint-disable react/prop-types */
import React from 'react'
import ScoreCard from './ScoreCard'
import { Link } from 'react-router-dom'

function TimeUp(props) {
  return (
    <div className='flex flex-col justify-center'>
        <div className='flex justify-center'>
            <img className='' src="https://em-content.zobj.net/source/apple/391/skull_1f480.png" alt="Skull" />
        </div>
        <div>
            <h1 className='text-black text-[3rem] cursor-default'>Game over!</h1>
        </div>
        <div className='flex justify-center'>
            <ScoreCard points={props.points}/>
        </div>
        <div>
            <Link to='/options'>
            <button className='bg-blue-400 border-2 border-b-[12px] border-black rounded-full py-4 px-36 m-4 hover:border-b-2 hover:scale-110 ease-in-out duration-200 hover:bg-blue-600'>
                Restart Game
            </button>
            </Link>
        </div>
    </div>
  )
}

export default TimeUp
