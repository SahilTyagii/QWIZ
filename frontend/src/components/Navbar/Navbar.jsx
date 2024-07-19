import React from 'react'
import Name from '../../assets/name.png'
import { NavLink } from 'react-router-dom'

const Navbar = () => {
  return (
    <div>
      <nav className='mt-2 w-auto flex justify-between mx-4 items-center px-4'>
        <NavLink to='/'><img className='h-20' src={Name} alt="QWIZ" /></NavLink>
        <div className='flex justify-center'>
        <NavLink to='/login'><h1 className='text-2xl text-slate-800 py-2 px-4'>Login</h1></NavLink>
        <NavLink to='/register'><button className='bg-red-700 rounded-full text-xl text-white py-1 px-4 btn-outline border-black border-2 hover:bg-red-900 h-12'>Register</button></NavLink>
        </div>
        <div className='rounded-full overflow-hidden bg-white hover:scale-110 ease-in-out duration-200 hidden'>
          <img className='size-16 overflow-hidden' src='avatars/0.png' alt="" />
        </div>
      </nav>
    </div>
  )
}

export default Navbar
