/* eslint-disable react/prop-types */
import React from 'react'
import ScoreCard from './ScoreCard'

function TimeUp(props) {
  return (
    <div className='flex flex-col justify-center'>
        <div className='flex justify-center'>
            <img className='' src="https://em-content.zobj.net/source/apple/391/skull_1f480.png" alt="Skull" />
        </div>
        <div>
            <h1 className='text-black text-[3rem]'>Time&#39;s up!</h1>
        </div>
        <div className='flex justify-center'>
            <ScoreCard points={props.points}/>
        </div>
    </div>
  )
}

export default TimeUp
