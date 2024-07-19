import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";
import Pattern from "../Pattern";
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex justify-center items-center p-12">
      <div className="bg-[#ECDDD9] flex flex-col justify-center lg:w-1/4 w-3/4 rounded-xl border-2 border-slate-700 p-1 or-shadow z-10">
        <div className="m-6">
          <h1 className="text-slate-700 text-4xl">LOGIN</h1>
        </div>
        <div>
          <form action="">
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
                Login
              </button>
            </div>
            <div>
              <p className="text-black my-6">
                Do not have an account?{" "}
                <Link to="/register" className="text-slate-700">
                  Sign up!
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
      <Pattern />
    </div>
  );
};

export default Login;
