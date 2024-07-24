import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext'; // Adjust the path as needed
import axios from 'axios';
import Pattern from '../Pattern';

function Profile() {
  const { user, setUser } = useContext(AuthContext);
  const [editMode, setEditMode] = useState(false);
  const [newUsername, setNewUsername] = useState(user.username || '');
  const [newAvatar, setNewAvatar] = useState(user.avatar || '');

  const handleUsernameChange = async () => {
    try {
      await axios.put(`/api/users/${user._id}/username`, { username: newUsername });
      setUser(prev => ({ ...prev, username: newUsername }));
      setEditMode(false);
    } catch (err) {
      console.error("Error updating username:", err);
    }
  };

  const handleAvatarChange = async (avatar) => {
    try {
      await axios.put(`/api/users/${user._id}/avatar`, { avatar });
      setUser(prev => ({ ...prev, avatar: avatar }));
      setNewAvatar(avatar)
      setEditMode(false);
    } catch (err) {
      console.error("Error updating avatar:", err);
    }
  };

  return (
    <div className='flex justify-center m-auto p-4'>
      <div className='bg-white/30 backdrop-blur-sm shadow-2xl flex flex-col justify-center items-center p-4 md:w-2/4 w-[95%] rounded-xl'>
        <div className='flex flex-col items-center'>
          <img
            className='w-24 h-24 rounded-full'
            src={`avatars/${newAvatar}.png`}
            alt='Avatar'
          />
          {editMode ? (
            <div className='mt-4 flex flex-col'>
              <label className='block mb-2 text-slate-600'>Change Username:</label>
              <div className='overflow-hidden rounded-lg'>
                <input
                    type='text'
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className='p-2 font-mono'
                />
                <button
                    onClick={handleUsernameChange}
                    className='mt-2 p-2 bg-blue-500 text-white font-mono'
                >
                    Save Username
                </button>
              </div>
              
            </div>
          ) : (
            <h2 className='text-6xl font-bold mt-4 text-gray-800'>{user.username}</h2>
          )}
          <p className='mt-2 text-lg'>Highscore: {user.highscore}</p>
          <p className='text-lg'>Accuracy: {user.accuracy}%</p>
          <button
            onClick={() => setEditMode(!editMode)}
            className='mt-4 p-2 bg-blue-500 text-white rounded'
          >
            {editMode ? 'Cancel' : 'Edit Profile'}
          </button>
          {editMode && (
            <div className='mt-4'>
              <label className='block mb-2 text-slate-500'>Change Avatar:</label>
              <div className='flex flex-wrap'>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((avatar) => (
                  <img
                    key={avatar}
                    src={`avatars/${avatar}.png`}
                    alt={avatar}
                    className='size-16 hover:scale-110 ease-in-out duration-200 rounded-full m-2 cursor-pointer'
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
