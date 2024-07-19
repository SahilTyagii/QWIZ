import React from "react";
import "./Home.css";
import Logo from "../Logo/Logo.jsx";
import Fox from "../../assets/fox.png";
import Porc from "../../assets/porc.png";
import Pattern from "../Pattern.jsx";
import { Link } from "react-router-dom"

function Home() {
  return (
    <>
      <div className="w-full h-full flex flex-col flex-wrap justify-centerfall">
        <Logo />
        <p className="text-3xl flex justify-center text-slate-800">
          <img
            className="size-8 m-1"
            src="https://em-content.zobj.net/source/apple/391/brain_1f9e0.png"
          />
          Quiz, Compete, Conquer!
          <img
            className="size-8 m-1"
            src="https://em-content.zobj.net/source/apple/391/nerd-face_1f913.png"
          />
        </p>
      </div>
      {/* <div className='w-full flex flex-row justify-center absolute'>
        <img className='w-full' src={Waves} alt="waves" />
      </div> */}
      <div className="flex md:flex-row flex-col md:justify-around flex-wrap justify-center">
        <img
          className="md:size-96 size-60 mx-auto hover:scale-110 ease-in-out duration-300 z-10"
          src={Fox}
          alt="fox"
        />

        <div className="flex flex-col">
          <div className="m-1">
            <Link to='/options'>
            <button className="bg-red-700 rounded-full sm:px-20 px-8 py-2 md:px-36 md:py-3 text-3xl my-red-btn hover:bg-red-900 my-10 z-10">
              Singleplayer
            </button>
            </Link>
          </div>
          <div className="m-1">
            <button className="bg-black rounded-full sm:px-20 px-12 py-2 md:px-36 md:py-3 text-3xl text-white my-black-btn z-10">
              Multiplayer
            </button>
          </div>
        </div>
        <img
          className="md:size-96 size-60 mx-auto  hover:scale-110 ease-in-out duration-300 z-10"
          src={Porc}
          alt="porcupine"
        />
        <Pattern />
      </div>
    </>
  );
}

export default Home;
