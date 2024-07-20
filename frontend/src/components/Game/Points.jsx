/* eslint-disable react/prop-types */
import React from 'react'

function Points(props) {
  return (
    <div className={`m-4 justify-center grid grid-cols-[repeat(auto-fit,_10%)] place-items-center`}>
      {props.points.map((correct, index) => (
        <div key={index} className={`${correct ? "bg-green-500" : "bg-red-500"} w-8 h-8 rounded-full border-4  border-black mx-0.5 my-2`}>
                
        </div>
      ))}
    </div>
  )
}

export default Points
