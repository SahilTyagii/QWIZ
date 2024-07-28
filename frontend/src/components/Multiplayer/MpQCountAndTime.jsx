/* eslint-disable react/prop-types */
import React from 'react'
import MpPoints from './MpPoints'

function MpQCountAndTime(props) {
  return (
    <div className='flex justify-center items-center'>
        <h1 className='border-[3px] border-black rounded-full px-2 py-2 bg-[#A855F7] mx-2 w-40 text-xl h-20 items-center flex'>Question {props.questionCount}/30</h1>
        <div className='lg:w-1/3 w-full md:block hidden'>
            <MpPoints points={props.points} sc={false}/>
          </div>
        <h1 className='border-[3px] border-black rounded-full px-2 py-2 bg-white mx-2 text-black flex w-40 justify-center text-xl h-20 items-center'><p className='rotate-12'>⏰</p> {props.time}</h1>
      </div>
  )
}

export default MpQCountAndTime
