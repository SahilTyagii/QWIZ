/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import QcntAndTime from './QcntAndTime';
import Points from './Points';
import TimeUp from './TimeUp';
import QuestionCard from './QuestionCard';
import he from 'he';

function Question(props) {
  const Questions = props.questions;
  const [points, setPoints] = useState([]);
  const [questionCount, setQuestionCount] = useState(1);
  const [time, setTime] = useState(60);
  const [timeOver, setTimeOver] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const [question, setQuestion] = useState({
    question: he.decode(Questions[currentQuestionIndex]?.question || ''),
    correct_answer: he.decode(Questions[currentQuestionIndex]?.correct_answer || ''),
    incorrect_answers: Questions[currentQuestionIndex]?.incorrect_answers.map(answer => he.decode(answer)) || []
  });

  const [shuffledAnswers, setShuffledAnswers] = useState([]);

  useEffect(() => {
    if (Questions[currentQuestionIndex]) {
      setQuestion({
        question: he.decode(Questions[currentQuestionIndex].question),
        correct_answer: he.decode(Questions[currentQuestionIndex].correct_answer),
        incorrect_answers: Questions[currentQuestionIndex].incorrect_answers.map(answer => he.decode(answer))
      });
    } else {
      setGameOver(true); // Set game over when no more questions
    }
  }, [currentQuestionIndex, Questions]);

  useEffect(() => {
    if (!gameOver) {
      setShuffledAnswers(
        [question.correct_answer, ...question.incorrect_answers].sort(() => Math.random() - 0.5)
      );
    }
  }, [question, gameOver]);

  useEffect(() => {
    if (time > 0 && !gameOver) {
      const timer = setTimeout(() => {
        setTime(prevTime => prevTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (time === 0) {
      setTimeOver(true);
    }
  }, [time, gameOver]);

  function onSelectAnswer(answer) {
    setPoints(prev => (
      [...prev, { ques: question.question, ans: question.correct_answer, correct: answer === question.correct_answer, id: currentQuestionIndex }]
    ));
    setQuestionCount(prev => prev + 1);
    setCurrentQuestionIndex(prev => prev + 1);
  }

  return (
    <div>
      {timeOver || gameOver ? (
        <TimeUp points={points} />
      ) : (
        <>
          <QcntAndTime questionCount={questionCount} time={time} />
          <div className='lg:w-1/3 w-full m-auto'>
            <Points points={points} sc={false} />
          </div>
          <QuestionCard question={question.question} shuffledAnswers={shuffledAnswers} onSelectAnswer={onSelectAnswer} />
        </>
      )}
    </div>
  );
}

export default Question;
