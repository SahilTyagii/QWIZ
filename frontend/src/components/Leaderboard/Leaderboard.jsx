import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import Pattern from '../Pattern';
import Loader from '../Loader/Loader';
import { AuthContext } from '../../context/AuthContext';
const apiUrl = import.meta.env.VITE_API_URL;

function Leaderboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useContext(AuthContext);

    async function getAllUsers() {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${apiUrl}/api/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data);
            setUsers((prev) => prev.sort((a, b) => b.highscore - a.highscore));
        } catch (err) {
            console.error("Error fetching users:", err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getAllUsers();
    }, []);

    return (
        <div className='flex justify-center m-auto'>
            <div className='bg-white/30 backdrop:blur-sm shadow-2xl flex flex-col justify-center items-center p-2 md:w-2/4 w-[95%] rounded-xl'>
                {loading || users.length === 0 ? (
                    <Loader />
                ) : (
                    users.map((item) => (
                        <div
                            key={item._id}
                            className={`p-2 rounded-full flex md:w-3/4 w-[95%] m-4 hover:scale-110 ease-in-out duration-200
                                ${item.username === user.username ? 'bg-yellow-300 text-gray-600' : 'bg-blue-900/30 backdrop-blur-sm shadow-2xl'}`}
                        >
                            <img
                                className="sm:size-20 size-16 rounded-full my-auto"
                                src={`avatars/${item.avatar}.png`}
                                alt="avatar"
                            />
                            <div className='flex flex-col items-center m-3 w-full'>
                                <p className='w-full text-left text-2xl cursor-default'>
                                    {item.username}
                                    {item.username === user.username && (" (you)")}
                                </p>
                                <p className='w-full text-left text-lg text-gray-600 cursor-default'>
                                    Accuracy: {item.accuracy}%
                                </p>
                            </div>
                            <p className='text-5xl p-2 text-center pr-6 my-auto cursor-default'>
                                {item.highscore}
                            </p>
                        </div>
                    ))
                )}
            </div>
            <Pattern />
        </div>
    );
}

export default Leaderboard;
