/* eslint-disable react/prop-types */
import React from 'react'

function ThreeSec(props) {
  return (
    <div>
      <div className='animate-bounce mt-20'>
        <h1 className='text-9xl m-2'>⏰</h1>
        <h1 className='text-5xl m-6 text-black'>Let the countdown begin!</h1>
      </div>
      <div>
        <h1 className='text-black' style={{fontSize: "10rem", fontWeight: "bold"}}>{props.remainingTime}</h1>
      </div>
    </div>
  )
}

export default ThreeSec
