import React from 'react'
import Name from '../../assets/name.png'

const Navbar = () => {
  return (
    <div>
      <nav className='mt-2 w-auto'>
        <img className='h-20' src={Name} alt="QWIZ" />
      </nav>
    </div>
  )
}

export default Navbar
