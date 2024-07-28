/* eslint-disable react/prop-types */
import React from 'react'

function QcntAndTime(props) {
  return (
    <div className='flex justify-center'>
        <h1 className='border-[3px] border-black rounded-full px-2 py-2 bg-[#A855F7] mx-2 w-40 text-xl cursor-default'>Question {props.questionCount}/30</h1>
        <h1 className='border-[3px] border-black rounded-full px-2 py-2 bg-white mx-2 text-black flex w-40 justify-center text-xl cursor-default'><p className='rotate-12'>⏰</p> {props.time}</h1>
      </div>
  )
}

export default QcntAndTime
