import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Join(props) {
    const [roomID, setRoomID] = useState("")
    const navigate = useNavigate()
    
    async function handleJoinGame(event) {
        event.preventDefault()
        if (roomID) {
            try {
                // const response = await axios.get(`http://localhost:4000/ws/${roomID}`)
                // if (response.status === 200) {
                //     console.log(response)
                // }
                navigate(`/room?roomID=${roomID}`)
            } catch(error) {
                console.error('Error joining room:', error);
            }
        }
    }

  return (
    <div className="bg-[#ECDDD9] flex flex-col justify-center lg:w-1/4 w-[98%] rounded-xl border-2 border-slate-700 p-1 or-shadow z-10">
        <div className="m-6">
                <h1 className="text-slate-700 text-4xl">Join game</h1>
            </div>
      <div>
        <form className="flex flex-col justify-start" onSubmit={handleJoinGame}>
            <div className="flex flex-col justify-start p-1 md:p-3 rounded-md">
            <label htmlFor="code" className='text-left text-lg text-black p-2'>Enter game code</label>
            <input
                className="text-lg bg-white p-2 rounded-md border-slate-700 border-2 border-dashed focus:border-solid focus:outline-none or-shadow text-gray-700 font-mono w-full"
                type="text"
                name="code"
                id="code"
                value={roomID}
                onChange={(event) => {setRoomID(event.target.value.substring(0, 6))}}
                placeholder="Enter 6 digit code"
            />
            </div>
            <div className="flex flex-col justify-start p-1 md:p-3 rounded-md">
                <button type="submit" className="bg-[#DE5399] border-slate-700 border-2 or-shadow rounded-md w-full h-12 text-black text-lg hover:bg-[#883c62]">Join Game</button>
            </div>
          
        </form>
      </div>
      <div className="my-6 mx-1 lg:mx-3 flex justify-end">
        <button
        className="bg-[#E0E0E0] border-slate-500 border-2 rounded-md w-32 h-8 text-black text-lg hover:bg-[#C0C0C0]"
        onClick={() => {
            // eslint-disable-next-line react/prop-types
            props.handleClick()
        }}>Host Game</button>
      </div>
    </div>
  );
}

export default Join;
