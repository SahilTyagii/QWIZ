/* eslint-disable react/prop-types */
import React from 'react'

function Points(props) {
  return (
    <div className='flex flex-row m-4 justify-center'>
      {props.points.map((correct, index) => (
        <div key={index} className={`${correct ? "bg-green-500" : "bg-red-500"} w-8 h-8 rounded-full border-4  border-black m-1`}>
                
        </div>
      ))}
    </div>
  )
}

export default Points
