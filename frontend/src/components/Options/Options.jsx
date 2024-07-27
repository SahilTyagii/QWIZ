import React, { useState, useEffect } from 'react'
import Pattern from '../Pattern'
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import { useNavigate } from 'react-router-dom';
import Categories from './Categories';

function Options() {
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [difficultyOpen, setDifficultyOpen] = useState(false)
  const difficulties = ["Any Difficulty", "easy", "medium", "hard"]
  const [settings, setSettings] = useState({category: {name: Categories[0].name, id: Categories[0].id}, difficulty: difficulties[0]})
  const [questionURL, setQuestionURL] = useState(`https://opentdb.com/api.php?amount=50&category=${settings.category.id}`)
  const navigate = useNavigate();

  useEffect(() => {
    const diff = settings.difficulty === "Any Difficulty" ? "" : `&difficulty=${settings.difficulty}`
    setQuestionURL(`https://opentdb.com/api.php?amount=30&category=${settings.category.id}${diff}`)
  }, [settings])

  const handleStartGame = (event) => {
    event.preventDefault();
    navigate(`/game?questionURL=${encodeURIComponent(questionURL)}`);
  }

  return (
    <div className="flex justify-center items-center md:p-12 p-4">
      <div className="bg-[#ECDDD9] flex flex-col justify-center lg:w-1/4 w-[98%] rounded-xl border-2 border-slate-700 p-1 or-shadow z-10">
        <div className="m-6">
          <h1 className="text-slate-700 text-4xl">Game options</h1>
        </div>
        <div>
          <form onSubmit={handleStartGame}>
            <div className="flex flex-col justify-start p-1 md:p-3 rounded-md">
              <label htmlFor="category" className='text-left text-lg text-black p-2'>Choose Category</label>
              <button
                name='category'
                onClick={(event) => {
                  setCategoryOpen((prev) => !prev)
                  setDifficultyOpen(false)
                  event.preventDefault()
                }}
                className={`flex justify-start bg-white text-black or-shadow text-lg px-2 py-0.5 rounded-md border-2 border-slate-700 ${categoryOpen ? "border-solid" : "border-dashed"}`}>
                <p className="my-auto mx-2">{settings.category.name}</p>
                <div className="my-auto ml-auto">
                  {categoryOpen ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                </div>
              </button>
            </div>
            {categoryOpen && (
              <div className="text-black absolute items-start p-2 w-auto bg-white/30 rounded-md grid md:grid-cols-2 mx-3 backdrop-blur-sm z-20 max-h-60 overflow-y-auto custom-scrollbar">
                {Categories.map((item) => (
                  <div
                    key={item.id}
                    id={item.id}
                    className="flex flex-col justify-between bg-white m-2 rounded-full"
                  >
                    <button
                      onClick={(event) => {
                        setSettings((prev) => ({
                          ...prev,
                          category: {
                            name: item.name,
                            id: item.id
                          }
                        }))
                        setCategoryOpen(false);
                        event.preventDefault();
                      }}
                      className="rounded-md p-1 bg-[#DCA256] hover:scale-110 border-2 border-slate-700"
                    >
                      {item.name}
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-col justify-start p-1 md:p-3 rounded-md">
              <label htmlFor="difficulty" className='text-left text-lg text-black p-2'>Choose Difficulty</label>
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
              <div className="text-black absolute items-start p-2 w-auto bg-white/30 rounded-md grid grid-cols-2 mx-3 backdrop-blur-sm z-20 max-h-40 overflow-y-auto custom-scrollbar">
                {difficulties.map((item, index) => (
                  <div
                    key={index}
                    id={index}
                    className="flex flex-col justify-between bg-white m-2 rounded-full"
                  >
                    <button
                      onClick={(event) => {
                        setSettings((prev) => ({
                          ...prev,
                          difficulty: difficulties[index]
                        }))
                        setDifficultyOpen(false);
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
              <button
                type="submit"
                className="bg-[#DE5399] border-slate-700 border-2 or-shadow rounded-md w-full h-12 text-black text-lg hover:bg-[#883c62]"
              >
                Start Game
              </button>
            </div>
          </form>
        </div>
      </div>
      <Pattern />
    </div>
  )
}

export default Options
