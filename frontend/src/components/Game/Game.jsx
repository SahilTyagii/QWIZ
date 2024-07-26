import React, { useState, useEffect } from 'react';
import Pattern from '../Pattern';
import Timer from './Timer';
import Question from './Question';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

function Game() {
  const [searchParams] = useSearchParams();
  const questionURL = searchParams.get('questionURL');
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showQuestion, setShowQuestion] = useState(false);
  const [remainingTime, setRemainingTime] = useState(3);

  async function getQuestionsFromAPI(url) {
    try {
      const tokenResponse = await axios.get('https://opentdb.com/api_token.php?command=request');
      const token = tokenResponse.data.token;
      const finalURL = `${url}&token=${token}`;
      const response = await axios.get(finalURL);
      setQuestions(response.data.results);
      setIsLoading(false)
      console.log(`URL: ${finalURL}`);
      console.log(`Token: ${token}`);
      console.log("response: ", response.data.results);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  }

  useEffect(() => {
    if (questionURL) {
      console.log('Fetching questions from API...');
      getQuestionsFromAPI(questionURL);
    } else {
      console.error('No questionURL provided');
    }
  }, [questionURL]);

  useEffect(() => {
    if (remainingTime > 0) {
      const timer = setTimeout(() => {
        setRemainingTime(prevTime => prevTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setShowQuestion(true);
    }
  }, [remainingTime]);

  return (
    <div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        !showQuestion ? (
          <Timer remainingTime={remainingTime} />
        ) : (
          <Question questions={questions} />
        )
      )}
      
      <Pattern />
    </div>
  );
}

export default Game;
