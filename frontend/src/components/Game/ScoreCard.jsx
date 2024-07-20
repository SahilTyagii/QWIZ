/* eslint-disable react/prop-types */
import React from 'react'
import Points from './Points'

function ScoreCard(props) {
  return (
    <div className='bg-white border-2 border-black text-black w-1/4 flex justify-center flex-col rounded-md text-2xl'>
      <h1 className='border-b-2 border-black'>You scored</h1>
      <Points points={props.points}/>
      <h1></h1>
    </div>
  )
}

export default ScoreCard
