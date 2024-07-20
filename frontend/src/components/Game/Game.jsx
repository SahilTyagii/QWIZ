import React, { useState, useEffect } from 'react';
import Pattern from '../Pattern';
import Timer from './Timer';
import Question from './Question';

function Game() {
  const [showQuestion, setShowQuestion] = useState(false);
  const [remainingTime, setRemainingTime] = useState(3);

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
      {!showQuestion ? (
        <Timer remainingTime={remainingTime} />
      ) : (
        <Question />
      )}
      <Pattern />
    </div>
  );
}

export default Game;
