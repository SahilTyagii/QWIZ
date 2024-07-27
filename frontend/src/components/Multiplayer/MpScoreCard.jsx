/* eslint-disable react/prop-types */
import React, { useContext, useEffect } from 'react';
import MpPoints from './MpPoints';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
const apiUrl = import.meta.env.VITE_API_URL;

function MpScoreCard(props) {
  const totalQuestions = props.points.length;
  const score = totalQuestions !== 0 ? props.points.reduce((accumulator, currentValue) => accumulator + Number(currentValue.correct), 0) : 0;
  const accuracy = totalQuestions !== 0 ? parseFloat(((score / totalQuestions) * 100).toFixed(2)) : 0;

  const { user, setUser } = useContext(AuthContext);

  async function updateHighscore() {
    if (user && score > (user.highscore || 0)) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error("No token found");
        }
        await axios.put(`${apiUrl}/api/users/${user._id}/highscore`, 
          { highscore: score }, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        await axios.put(`${apiUrl}/api/users/${user._id}/accuracy`, 
          { accuracy: accuracy }, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Optionally update user context
        setUser(prev => ({ ...prev, highscore: score, accuracy }));
      } catch (err) {
        console.error("Cannot update highscore: ", err.response?.data || err.message);
      }
    }
  }

  useEffect(() => {
    if (user && props.points.length > 0) {
      updateHighscore();
    }
  }, [score, user, props.points]);

  return (
    <div className='bg-white border-2 border-black text-black w-[90%] md:w-1/2 lg:w-1/4 flex justify-center flex-col rounded-md text-3xl'>
      <h1 className='border-b-2 border-black py-4'>You scored</h1>
      <MpPoints points={props.points} sc={true} />
      <h1 className='border-t-2 border-black bg-[#8B5CF6] text-white py-4'>
        {score} {score === 1 ? "point" : "points"}<br />Accuracy: {accuracy}%
      </h1>
    </div>
  );
}

export default MpScoreCard;
