import React, { useState, useEffect } from 'react';
import Pattern from '../Pattern';
import Timer from './Timer';
import Question from './Question';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Loader from '../Loader/Loader';
import Countdown from "../../assets/Countdown.mp3";
import three from "../../assets/3sec.mp3";

function Game() {
  const [searchParams] = useSearchParams();
  const questionURL = searchParams.get('questionURL');
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showQuestion, setShowQuestion] = useState(false);
  const [remainingTime, setRemainingTime] = useState(3);
  const [audio] = useState(new Audio(Countdown));
  
  // Function to handle cleanup
  const cleanupAudio = () => {
    audio.pause();
    audio.currentTime = 0;
  };

  async function getQuestionsFromAPI(url) {
    try {
      const tokenResponse = await axios.get('https://opentdb.com/api_token.php?command=request');
      const token = tokenResponse.data.token;
      const finalURL = `${url}&token=${token}`;
      const response = await axios.get(finalURL);
      setQuestions(response.data.results);
      setIsLoading(false);
      console.log(`URL: ${finalURL}`);
      console.log(`Token: ${token}`);
      console.log("response: ", response.data.results);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  }

  useEffect(() => {
    if (remainingTime === 3) {
      new Audio(three).play();
    }
    if (questionURL) {
      console.log('Fetching questions from API...');
      getQuestionsFromAPI(questionURL);
    } else {
      console.error('No questionURL provided');
    }
  }, [questionURL]);

  useEffect(() => {
    let timer;
    if (remainingTime > 0) {
      timer = setTimeout(() => {
        setRemainingTime(prevTime => prevTime - 1);
      }, 1000);
    } else {
      setShowQuestion(true);
      audio.play();
    }
    return () => {
      clearTimeout(timer); // Cleanup the timer
      cleanupAudio(); // Cleanup the audio
    };
  }, [remainingTime, audio]);

  function countdownStop() {
    cleanupAudio();
  }

  return (
    <div>
      {isLoading ? (
        <Loader />
      ) : (
        !showQuestion ? (
          <Timer remainingTime={remainingTime} />
        ) : (
          <Question questions={questions} countdownStop={countdownStop} />
        )
      )}
      <Pattern />
    </div>
  );
}

export default Game;
