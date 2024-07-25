import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import Pattern from '../Pattern';

const apiUrl = import.meta.env.VITE_API_URL;

function Profile() {
  const { user, setUser } = useContext(AuthContext);
  const [editMode, setEditMode] = useState(false);
  const [newUsername, setNewUsername] = useState(user.username || '');
  const [newAvatar, setNewAvatar] = useState(user.avatar || '');

  useEffect(() => {
    async function getUser() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${apiUrl}/api/users/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
        setNewUsername(response.data.username);
        setNewAvatar(response.data.avatar);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
    if (user._id) {
      getUser();
    }
  }, [user._id, setUser]);

  const handleUsernameChange = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${apiUrl}/api/users/${user._id}/username`, { username: newUsername }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(prev => ({ ...prev, username: newUsername }));
      setEditMode(false);
    } catch (err) {
      console.error("Error updating username:", err);
    }
  };

  const handleAvatarChange = async (avatar) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${apiUrl}/api/users/${user._id}/avatar`, { avatar }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(prev => ({ ...prev, avatar: avatar }));
      setNewAvatar(avatar);
      setEditMode(false);
    } catch (err) {
      console.error("Error updating avatar:", err);
    }
  };

  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-100 p-4'>
      <div className='bg-white/90 backdrop-blur-sm shadow-2xl flex flex-col justify-center items-center p-6 md:w-2/4 w-full rounded-xl'>
        <div className='flex flex-col items-center'>
          <img
            className='w-32 h-32 rounded-full border-4 border-gray-300'
            src={`avatars/${newAvatar}.png`}
            alt='Avatar'
          />
          {editMode ? (
            <div className='mt-4 flex flex-col items-center'>
              <label className='block mb-2 text-gray-600 text-lg'>Change Username:</label>
              <div className='flex flex-col items-center space-y-2'>
                <input
                  type='text'
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className='p-2 border border-gray-300 rounded-lg text-lg font-mono'
                />
                <button
                  onClick={handleUsernameChange}
                  className='mt-2 px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition duration-300'
                >
                  Save Username
                </button>
              </div>
            </div>
          ) : (
            <h2 className='text-3xl font-bold mt-4 text-gray-800'>{newUsername}</h2>
          )}
          <p className='mt-2 text-lg text-gray-700'>Highscore: {user.highscore}</p>
          <p className='text-lg text-gray-700'>Accuracy: {user.accuracy}%</p>
          <button
            onClick={() => setEditMode(!editMode)}
            className='mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300'
          >
            {editMode ? 'Cancel' : 'Edit Profile'}
          </button>
          {editMode && (
            <div className='mt-4'>
              <label className='block mb-2 text-gray-600 text-lg'>Change Avatar:</label>
              <div className='flex flex-wrap justify-center'>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((avatar) => (
                  <img
                    key={avatar}
                    src={`avatars/${avatar}.png`}
                    alt={avatar}
                    className='w-16 h-16 rounded-full border-2 border-gray-300 m-2 cursor-pointer hover:scale-110 transform transition duration-300'
                    onClick={() => handleAvatarChange(avatar)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Pattern />
    </div>
  );
}

export default Profile;
