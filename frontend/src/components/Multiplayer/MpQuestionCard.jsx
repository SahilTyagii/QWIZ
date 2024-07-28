/* eslint-disable react/prop-types */
import React from 'react'

function MpQuestionCard(props) {
  return (
    <div className='flex justify-center items-center p-2'>
        <div className="bg-[#ECDDD9] flex flex-col justify-center lg:w-1/4 w-[85%] rounded-xl border-2 border-slate-700 p-1 or-shadow text-slate-700">
        <div className="p-4 text-lg cursor-default">{props.question}</div>
        {props.shuffledAnswers.map((answer, index) => (
            <button key={index} onClick={() => props.onSelectAnswer(answer)} className='bg-white text-black or-shadow text-lg px-2 py-0.5 rounded-md border-2 border-slate-700 hover:bg-slate-300 m-2'>
                {answer}
            </button>
        ))}
        </div>
    </div>
  )
}

export default MpQuestionCard
