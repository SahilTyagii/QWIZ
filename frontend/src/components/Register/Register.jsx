import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"
import "./Register.css";
import Pattern from "../Pattern";
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SelectAvatar from "../SelectAvatar";
import Loader from "../Loader/Loader";
const apiUrl = import.meta.env.VITE_API_URL

function Register() {
  const [avatar, setAvatar] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  function getAvatar(v) {
    setAvatar(v)
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  async function handleRegister(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.post(`${apiUrl}/api/register`, {username, password, avatar})
      // registration succesfull redirect to login page
      navigate("/login")
    } catch(err) {
      console.error("Error during registration: ", err)
      // TODO: SHOW CANT REGISTER TO USER
      alert("Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center p-12 h-full">
      {loading && <Loader />}
      <div className="bg-[#ECDDD9] flex flex-col justify-center lg:w-1/4 w-3/4 rounded-xl border-2 border-slate-700 p-1 or-shadow z-10">
        <div className="m-6">
          <h1 className="text-slate-700 text-4xl">Register</h1>
        </div>
        <div>
          <form onSubmit={handleRegister}>
            <SelectAvatar avatar={avatar} getAvatar={getAvatar}/>
            <div className="flex flex-col justify-start p-1 md:p-3">
              <label
                htmlFor="username"
                className="text-left text-lg text-black p-2"
              >
                Username
              </label>
              <input
                className="text-lg bg-white p-2 rounded-md border-slate-700 border-2 border-dashed focus:border-solid focus:outline-none or-shadow text-gray-700 font-mono"
                type="text"
                name="username"
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(event) => {
                  const val = event.target.value
                  setUsername(val)
                }}
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
                  className="text-lg bg-white p-2 rounded-md border-slate-700 border-2 border-dashed focus:border-solid focus:outline-none or-shadow text-gray-700 w-full font-mono"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => {
                    const val = event.target.value
                    setPassword(val)
                  }}
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
