import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Join from './Join'
import Host from './Host'
import Pattern from '../Pattern'

function Lobby() {
    const [isHost, setIsHost] = useState(false)
    const [choosed, setChoosed] = useState(false)

    function handleClick() {
        setIsHost((prev) => !prev)
    }

  return (
    <div className='flex justify-center items-center p-12'>
        {
            choosed ? (
                <>
                    {
                        isHost ? (
                            <Host handleClick={handleClick}/>
                        ) : (
                            <Join handleClick={handleClick}/>
                        )
                    }
                </>
            ) : (
                <div className="bg-[#ECDDD9] flex flex-col justify-center lg:w-1/4 w-3/4 rounded-xl border-2 border-slate-700 py-8 or-shadow z-10">
                    <div className="m-6">
                        <h1 className="text-slate-700 text-4xl">Multiplayer</h1>
                    </div>
                    <div className="my-2 h-12 mx-1 lg:mx-3">
                        <button
                            onClick={() => {
                                setChoosed(true)
                                setIsHost(false)
                            }}
                            className="bg-[#DE5399] border-slate-700 border-2 or-shadow rounded-md w-full h-12 text-black text-lg hover:bg-[#883c62]"
                        >
                            Join Game
                        </button>
                    </div>
                    <div className="my-2 h-12 mx-1 lg:mx-3">
                        <button
                        onClick={() => {
                            setChoosed(true)
                            setIsHost(true)
                        }}
                            className="bg-[#DE5399] border-slate-700 border-2 or-shadow rounded-md w-full h-12 text-black text-lg hover:bg-[#883c62]"
                        >
                            Host Game
                        </button>
                    </div>
                    <div>
                    <p className="text-black mt-6">
                        <Link to="/options" className="text-slate-700">
                        Play singleplayer?
                        </Link>
                    </p>
                    </div>
                </div>
            )
        }
        
        <Pattern />
    </div>
  )
}

export default Lobby
