import React, { useState } from "react";
import { Link } from "react-router-dom";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import "./Register.css";
import Pattern from "../Pattern";
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';

function Register() {
  const idxs = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  const [avatar, setAvatar] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex justify-center items-center p-12 h-full">
      <div className="bg-[#ECDDD9] flex flex-col justify-center lg:w-1/4 w-3/4 rounded-xl border-2 border-slate-700 p-1 or-shadow z-10">
        <div className="m-6">
          <h1 className="text-slate-700 text-4xl">Register</h1>
        </div>
        <div>
          <form action="">
            <div className="flex flex-col justify-start p-1 md:p-3 rounded-md">
              <button
                onClick={(event) => {
                  setIsOpen((prev) => !prev);
                  event.preventDefault();
                }}
                className="justify-start flex bg-white text-black or-shadow text-lg px-2 py-0.5 rounded-md border-2 border-slate-700 border-dashed active:border-solid"
              >
                <img
                  className="size-14 rounded-full overflow-hidden"
                  src={`avatars/${avatar}.png`}
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
                        setAvatar(item);
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
            <div className="flex flex-col justify-start p-1 md:p-3">
              <label
                htmlFor="username"
                className="text-left text-lg text-black p-2"
              >
                Username
              </label>
              <input
                className="text-lg bg-white p-2 rounded-md border-slate-700 border-2 border-dashed focus:border-solid focus:outline-none or-shadow text-gray-700"
                type="text"
                name="username"
                id="username"
                placeholder="Enter your username"
              />
            </div>
            <div className="flex flex-col justify-start p-1 md:p-3">
              <label
                htmlFor="password"
                className="text-left text-lg text-black p-2"
              >
                Password
              </label>
              <div className="flex items-center relative">
                <input
                  className="text-lg bg-white p-2 rounded-md border-slate-700 border-2 border-dashed focus:border-solid focus:outline-none or-shadow text-gray-700 w-full"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  placeholder="Enter your password"
                />
                <span
                  className="absolute right-3 text-black cursor-pointer"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </span>
              </div>
            </div>
            <div className="my-6 h-12 mx-1 lg:mx-3">
              <button
                type="submit"
                className="bg-[#DE5399] border-slate-700 border-2 or-shadow rounded-md w-full h-12 text-black text-lg hover:bg-[#883c62]"
              >
                Create account
              </button>
            </div>
            <div>
              <p className="text-black my-6">
                Have an account?{" "}
                <Link to="/login" className="text-slate-700">
                  Login!
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
      <Pattern />
      {/* <div className='w-full flex flex-row justify-center absolute bg-white bottom-0 h-1/2 overflow-hidden' style={{backgroundImage: "url(https://www.transparenttextures.com/patterns/arches.png)", backgroundColor:"white"}}>
        <img className='w-full absolute top-0' src={Waves} alt="waves" />
        <div className='w-full h-1/2 absolute bottom-0 -z-10 overflow-hidden' style={{backgroundImage: "url(https://www.transparenttextures.com/patterns/arches.png)", backgroundColor:"white"}}></div>
      </div> */}
    </div>
  );
}

export default Register;
