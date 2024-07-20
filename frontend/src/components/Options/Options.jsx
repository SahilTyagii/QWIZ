import React, { useState } from 'react'
import Pattern from '../Pattern'
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import { Link } from 'react-router-dom';

function Options() {
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [difficultyOpen, setDifficultyOpen] = useState(false)
  const categories = ["Any Category", "Games", "Movie", "Sports", "Music"]
  const difficulties = ["Any Difficulty", "Easy", "Medium", "Hard"]
  const [settings, setSettings] = useState({category: categories[0], difficulty: difficulties[0]})
  

  return (
    <div className="flex justify-center items-center p-12">
      <div className="bg-[#ECDDD9] flex flex-col justify-center lg:w-1/4 w-3/4 rounded-xl border-2 border-slate-700 p-1 or-shadow z-10">
        <div className="m-6">
          <h1 className="text-slate-700 text-4xl">Game options</h1>
        </div>
        <div>
          <form action="">
          <div className="flex flex-col justify-start p-1 md:p-3 rounded-md">
            <label htmlFor="category" className='text-left text-lg text-black p-2'>Chose Category</label>
            <button
            name='category'
            onClick={(event) => {
                setCategoryOpen((prev) => !prev)
                setDifficultyOpen(false)
                event.preventDefault()
            }}
            className={`flex justify-start bg-white text-black or-shadow text-lg px-2 py-0.5 rounded-md border-2 border-slate-700 ${categoryOpen ? "border-solid" : "border-dashed"}`}>
                    <p className="my-auto mx-2">{settings.category}</p>
                    <div className="my-auto ml-auto">
                    {categoryOpen ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                    </div>
            </button>
        </div>
        {categoryOpen && (
            <div className="text-black absolute items-start p-2 w-auto bg-white/30 rounded-md grid grid-cols-2 mx-3 backdrop-blur-sm z-20">
            {categories.map((item, index) => (
              <div
                key={index}
                id={index}
                className="flex flex-col justify-between bg-white m-2 rounded-full"
              >
                <button
                  onClick={(event) => {
                    setSettings((prev) => {
                      return {
                        ...prev,
                        category: categories[index]
                      }
                    })
                    setCategoryOpen((prev) => !prev);
                    event.preventDefault();
                  }}
                  className="rounded-md p-1 bg-[#DCA256] hover:scale-110 border-2 border-slate-700"
                >
                  {item}
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex flex-col justify-start p-1 md:p-3 rounded-md">
            <label htmlFor="difficulty" className='text-left text-lg text-black p-2'>Chose Difficulty</label>
            <button
            name='difficulty'
            onClick={(event) => {
                setDifficultyOpen((prev) => !prev)
                setCategoryOpen(false)
                event.preventDefault()
            }}
            className={`flex justify-start bg-white text-black or-shadow text-lg px-2 py-0.5 rounded-md border-2 border-slate-700 ${difficultyOpen ? "border-solid" : "border-dashed"}`}>
                    <p className="my-auto mx-2">{settings.difficulty}</p>
                    <div className="my-auto ml-auto">
                    {difficultyOpen ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                    </div>
            </button>
        </div>
        {difficultyOpen && (
            <div className="text-black absolute items-start p-2 w-auto bg-white/30 rounded-md grid grid-cols-2 mx-3 backdrop-blur-sm z-20">
            {difficulties.map((item, index) => (
              <div
                key={index}
                id={index}
                className="flex flex-col justify-between bg-white m-2 rounded-full"
              >
                <button
                  onClick={(event) => {
                    setSettings((prev) => {
                      return {
                        ...prev,
                        difficulty: difficulties[index]
                      }
                    })
                    setDifficultyOpen((prev) => !prev);
                    event.preventDefault();
                  }}
                  className="rounded-md p-1 bg-[#DCA256] hover:scale-110 border-2 border-slate-700"
                >
                  {item}
                </button>
              </div>
            ))}
          </div>
        )}
            <div className="my-6 h-12 mx-1 lg:mx-3">
              <Link to='/game'>
                <button
                  type="submit"
                  className="bg-[#DE5399] border-slate-700 border-2 or-shadow rounded-md w-full h-12 text-black text-lg hover:bg-[#883c62]"
                >
                  Start Game
                </button>
              </Link>
              
            </div>
            <div>
            </div>
          </form>
        </div>
      </div>
      <Pattern />
    </div>
  )
}

export default Options
