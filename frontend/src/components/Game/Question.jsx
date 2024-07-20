import React, { useState, useEffect } from 'react'
import QcntAndTime from './QcntAndTime'
import Points from './Points'
import TimeUp from './TimeUp'

function Question() {
    const [points, setPoints] = useState([false, true, true, false, false, false, false, false, false, false, true, false, true, false])
    const [question, setQuestion] = useState(1)
    const [time, setTime] = useState(60)
    const [timeOver, setTimeOver] = useState(false)

    useEffect(() => {
        if (time > 0) {
            const timer = setTimeout(() => {
                setTime((prevTime) => prevTime - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            setTimeOver(true)
        }
    }, [time]);

  return (
    <div>
        {timeOver ? (
            <TimeUp points={points}/>
        ) : (
            <>
            <QcntAndTime question = {question} time = {time}/>
            <Points points={points} sc={false}/>
            </>
        )}
      
    </div>
  )
}

export default Question
