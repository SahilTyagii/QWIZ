import Name from '../assets/name.png'

const Navbar = () => {
  return (
    <div>
      <nav className='mt-2 mx-4 w-full'>
        <img className='h-20' src={Name} alt="QWIZ" />
      </nav>
    </div>
  )
}

export default Navbar
