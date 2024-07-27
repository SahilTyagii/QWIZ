import React, { useContext, useState } from "react";
import Name from "../../assets/name.png";
import { NavLink, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import LeaderboardRoundedIcon from '@mui/icons-material/LeaderboardRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import GitHubIcon from '@mui/icons-material/GitHub';
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';

function Navbar() {
    const { isAuthenticated, user, logout, loading } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
    };

    if (loading) {
        return <div className="animate-spin"><RestartAltRoundedIcon /></div>; // Or a spinner, or any loading indicator
    }

    return (
        <div>
            <nav className="mt-2 w-auto flex justify-between mx-4 items-center px-4 pb-2">
                <NavLink to="/">
                    <img className="h-14 md:h-20" src={Name} alt="QWIZ" />
                </NavLink>
                {isAuthenticated && user ? (
                    <div className="relative">
                        <div className="flex items-center bg-white/30 backdrop:blur-sm md:px-4 px-1 py-2 rounded-2xl hover:scale-110 ease-in-out duration-200 cursor-pointer" onClick={() => setIsOpen((prev) => !prev)}>
                        {
                            isOpen ? (
                                <ArrowDropUpIcon />
                            ) : (
                                <ArrowDropDownIcon />
                            )
                        }                        
                        <div
                            className="rounded-full overflow-hidden pl-1"
                        >
                            <img
                                className="size-12 md:size-16 object-cover"
                                src={`avatars/${user.avatar}.png`}
                                alt={user.username}
                            />
                        </div>
                        </div>
                        {isOpen && (
                            <div className="absolute top-24 right-1 bg-white/30 backdrop-blur-lg shadow-lg rounded-lg p-4 flex flex-col w-max z-40">
                                <p className="text-slate-900 text-xl pb-2 mx-2 mb-2 font-bold border-b-2 border-slate-600/30 cursor-default">
                                    {user.username}
                                </p>
                                <NavLink
                                    to="/"
                                    className={({ isActive }) =>
                                        isActive
                                            ? "text-slate-500 m-2 font-bold text-left hover:scale-110"
                                            : "text-slate-700 m-2 font-bold text-left hover:scale-110"
                                    }
                                    onClick={() => setIsOpen((prev) => !prev)}
                                >
                                    <p>
                                        <HomeRoundedIcon />
                                        Home
                                    </p>
                                </NavLink>
                                <NavLink
                                    to="/profile"
                                    className={({ isActive }) =>
                                        isActive
                                            ? "text-slate-500 m-2 font-bold text-left hover:scale-110"
                                            : "text-slate-700 m-2 font-bold text-left hover:scale-110"
                                    }
                                    onClick={() => setIsOpen((prev) => !prev)}
                                >
                                    <p>
                                        <PersonRoundedIcon />
                                        Profile
                                    </p>
                                </NavLink>
                                <NavLink
                                    to="/leaderboard"
                                    className={({ isActive }) =>
                                        isActive
                                            ? "text-slate-500 m-2 font-bold text-left hover:scale-110"
                                            : "text-slate-700 m-2 font-bold text-left hover:scale-110"
                                    }
                                    onClick={() => setIsOpen((prev) => !prev)}
                                >
                                    <p>
                                        <LeaderboardRoundedIcon />
                                        Leaderboard
                                    </p>
                                </NavLink>
                                <Link to="https://github.com/SahilTyagii">
                                  <p className="text-slate-700 m-2 font-bold text-left hover:scale-110">
                                    <GitHubIcon />Connect
                                  </p>
                                </Link>
                                <button
                                    className="bg-red-600 rounded-lg px-3 py-2 my-2 text-white hover:bg-red-900"
                                    onClick={handleLogout}
                                >
                                    <LogoutRoundedIcon />Logout
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <NavLink to="/login">
                            <h1 className="text-2xl text-slate-800 py-2 px-4">
                                Login
                            </h1>
                        </NavLink>
                        <NavLink to="/register">
                            <button className="bg-red-700 rounded-full text-xl text-white py-1 px-4 border-black border-2 hover:bg-red-900 h-12">
                                Register
                            </button>
                        </NavLink>
                    </div>
                )}
            </nav>
        </div>
    );
}

export default Navbar;
