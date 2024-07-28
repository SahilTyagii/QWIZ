/* eslint-disable react/prop-types */
import React from 'react';
import './Points.css'

function MpPoints(props) {
  return (
    <div className="m-4 justify-center grid grid-cols-[repeat(auto-fit,_10%)] place-items-center">
      {props.points.map((item) => (
        <div key={item.id} className="relative flex flex-col items-center">
          <div className={`${item.correct ? "bg-green-500" : "bg-red-500"} w-8 h-8 rounded-full border-4 border-black mx-0.5 my-2`}></div>
          <div className="tooltip bg-white/30 backdrop-blur-sm absolute mt-10 p-2 rounded-lg text-slate-700 text-sm w-40 hidden z-30">
            <p className="font-bold text-slate-500 cursor-default">{item.ques}</p>
            <p>{item.ans}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default MpPoints;
