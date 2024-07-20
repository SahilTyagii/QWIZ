/* eslint-disable react/prop-types */
import React from 'react'
import Points from './Points'

function ScoreCard(props) {
    const score = props.points.reduce((accumulator, currentValue) => accumulator + currentValue)

  return (
    <div className='bg-white border-2 border-black text-black w-[90%] md:w-1/2 lg:w-1/4 flex justify-center flex-col rounded-md text-3xl'>
      <h1 className='border-b-2 border-black py-4'>You scored</h1>
      <Points points={props.points} sc={true}/>
      <h1 className='border-t-2 border-black bg-[#8B5CF6] text-white py-4'>{score} {score === 1 ? "point" : "points"}</h1>
    </div>
  )
}

export default ScoreCard
