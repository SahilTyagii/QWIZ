import React, { useState } from 'react'
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";

/* eslint-disable react/prop-types */ // TODO: upgrade to latest eslint tooling
function SelectAvatar(props) {
    const [isOpen, setIsOpen] = useState(false)
    const idxs = [0, 1, 2, 3, 4, 5, 6, 7, 8]

  return (
    <>
        <div className="flex flex-col justify-start p-1 md:p-3 rounded-md">
            <button
            onClick={(event) => {
                setIsOpen((prev) => !prev)
                event.preventDefault()
            }}
            className={`flex justify-start bg-white text-black or-shadow text-lg px-2 py-0.5 rounded-md border-2 border-slate-700 ${isOpen ? "border-solid" : "border-dashed"}`}>
                    <img
                    className="size-14 rounded-full overflow-hidden"
                    src={`avatars/${props.avatar}.png`}
                    alt="Avatar"
                    />
                    <p className="my-auto mx-2">Avatar</p>
                    <div className="my-auto ml-auto">
                    {isOpen ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                    </div>
            </button>
        </div>
        {isOpen && (
            <div className="text-black absolute items-start p-2 w-auto bg-white/30 rounded-md grid grid-cols-3 mx-3 backdrop-blur-sm z-20">
            {idxs.map((item) => (
              <div
                key={item}
                id={item}
                className="flex flex-col justify-between bg-white m-2 rounded-full"
              >
                <button
                  onClick={(event) => {
                    props.getAvatar(item)
                    setIsOpen((prev) => !prev);
                    event.preventDefault();
                  }}
                  className="rounded-full"
                >
                  <img
                    className="size-20 rounded-full hover:scale-110"
                    src={`avatars/${item}.png`}
                    alt="avatars"
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </>
  )
}

export default SelectAvatar
