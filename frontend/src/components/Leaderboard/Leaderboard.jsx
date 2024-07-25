import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Pattern from '../Pattern';
const apiUrl = import.meta.env.VITE_API_URL

function Leaderboard() {
    const [users, setUsers] = useState([]);

    async function getAllUsers() {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${apiUrl}/api/users`, {
                headers: {Authorization: `Bearer ${token}`}
            });
            setUsers(response.data);
            setUsers((prev) => prev.sort((a, b) => b.highscore - a.highscore))
        } catch (err) {
            console.error("Error fetching users:", err);
        }
    }

    useEffect(() => {
        getAllUsers();
    }, []);

    return (
        <div className='flex justify-center m-auto'>
            <div className='bg-white/30 backdrop:blur-sm shadow-2xl flex flex-col justify-center items-center p-2 md:w-2/4 w-[95%] rounded-xl'>
                {users.length === 0 ? (
                    <p className='text-center text-lg'>Loading...</p>
                ) : (
                    users.map((item) => (
                        <div className='bg-blue-900/30 backdrop-blur-sm shadow-2xl p-2 rounded-full flex md:w-3/4 w-[95%] m-4 hover:scale-110 ease-in-out duration-200' key={item._id}>
                            <img
                                className="sm:size-20 size-16 rounded-full my-auto"
                                src={`avatars/${item.avatar}.png`}
                                alt="avatars"
                            />
                            <div className='flex flex-col items-center m-3 w-full'>
                                <p className='w-full text-left text-2xl'>
                                    {item.username}
                                </p>
                                <p className='w-full text-left text-lg text-gray-600'>
                                    Accuracy: {item.accuracy}%
                                </p>
                            </div>
                            <p className='text-5xl p-2 text-center pr-6 my-auto'>
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
