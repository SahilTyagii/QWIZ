/* eslint-disable react/prop-types */
import React from 'react'

function Scoreboard(props) {
  return (
    <div className='flex justify-center mt-2'>
    <div className='bg-white flex flex-col justify-center lg:w-1/4 w-[85%] rounded-xl border-2 border-black overflow-hidden text-slate-700'>
        <div className='bg-black'>
            <h1 className='text-white text-2xl'>
              Score
            </h1>
        </div>
        <div>
          {
            props.playerState.map((player, index) => (
              <div key={index}>
                {
                  (
                    <div className='text-black flex justify-around text-xl m-2'>
                      <h1>
                        {player.player}{player.player === props.user.username && (
                          " (YOU)"
                        )}
                      </h1>
                      <h1>
                        {player.state.Score} out of {player.state.CurrentQuestion}
                      </h1>
                    </div>
                  )
                }
              </div>
            ))
          }
        </div>
    </div>
    </div>
  )
}

export default Scoreboard
