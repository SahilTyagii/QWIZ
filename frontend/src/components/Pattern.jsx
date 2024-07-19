import React from 'react'
import Waves from '../assets/blue_wave.png'

function Pattern() {
  return (
    <div className='w-full flex flex-row justify-center absolute bg-white bottom-0 h-1/2' style={{backgroundImage: "url(https://www.transparenttextures.com/patterns/arches.png)", backgroundColor:"white"}}>
        <img className='w-full absolute top-0' src={Waves} alt="waves" />
        <div className='w-full h-1/2 absolute bottom-0 -z-10' style={{backgroundImage: "url(https://www.transparenttextures.com/patterns/arches.png)", backgroundColor:"white"}}></div>
    </div>
  )
}

export default Pattern
