import React, { useState, useEffect } from 'react'
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import Categories from '../Options/Categories';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Loader from '../Loader/Loader';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const apiUrl = import.meta.env.VITE_API_URL

function Host(props) {
    const [categoryOpen, setCategoryOpen] = useState(false)
    const [difficultyOpen, setDifficultyOpen] = useState(false)
    const difficulties = ["Any Difficulty", "easy", "medium", "hard"]
    const [settings, setSettings] = useState({category: {name: Categories[0].name, id: Categories[0].id}, difficulty: difficulties[0]})
    const [questionURL, setQuestionURL] = useState(`https://opentdb.com/api.php?amount=50&category=${settings.category.id}`)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        const diff = settings.difficulty === "Any Difficulty" ? "" : `&difficulty=${settings.difficulty}`
        setQuestionURL(`https://opentdb.com/api.php?amount=30&category=${settings.category.id}${diff}`)
    }, [settings])

    const handleHostGame = async (event) => {
    event.preventDefault();
    setLoading(true);
    console.log(questionURL);
    try {
        const response = await axios.post(`${apiUrl}/create-room`, {
            "questionURL": questionURL,
        });
        console.log(response.data);
        const data = response.data;
        if (data.response_code === 0) {
            // no questions
            toast.error("Not enough questions on given parameters");
            setLoading(false);
            return;
        } else {
            const roomID = response.data.roomID;
            console.log(roomID);
            navigate(`/room?roomID=${encodeURIComponent(roomID)}`);
            // join room with roomID
        }
    } catch (error) {
        console.error("Error hosting game:", error);
    } finally {
        setLoading(false);
    }
}

    

    return (
        <div className="bg-[#ECDDD9] flex flex-col justify-center lg:w-1/4 w-[98%] rounded-xl border-2 border-slate-700 p-1 or-shadow z-10">
            {loading && <Loader />}
            <div className="m-6">
                <h1 className="text-slate-700 text-4xl cursor-default">Host game</h1>
            </div>
            <div>
                <form onSubmit={handleHostGame}>
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
                            <p className="my-auto mx-2 cursor-default">{settings.category.name}</p>
                            <div className="my-auto ml-auto">
                                {categoryOpen ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                            </div>
                        </button>
                    </div>
                    {categoryOpen && (
              <div className="text-black items-start w-full bg-white/30 rounded-md grid md:grid-cols-1 backdrop-blur-sm z-20 max-h-60 overflow-auto custom-scrollbar">
                {Categories.map((item) => (
                  <div
                    key={item.id}
                    id={item.id}
                    className="flex flex-col justify-between bg-white m-2 mx-4 rounded-full w-[calc(100%-2rem)]"
                  >
                    <button
                      onClick={(event) => {
                        setSettings((prev) => ({
                          ...prev,
                          category: {
                            name: item.name,
                            id: item.id
                          }
                        }));
                        setCategoryOpen(false);
                        event.preventDefault();
                      }}
                      className="rounded-md p-1 bg-[#DCA256] hover:scale-105 border-2 border-slate-700 w-full"
                    >
                      {item.name}
                    </button>
                    
                  </div>
                ))}
                <div className='dropdown-gradient'></div>
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
                            <p className="my-auto mx-2 cursor-default">{settings.difficulty}</p>
                            <div className="my-auto ml-auto">
                                {difficultyOpen ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                            </div>
                        </button>
                    </div>
                    {difficultyOpen && (
              
              <div className="text-black items-start p-2 w-[calc(100%+2rem)] bg-white/30 rounded-md grid grid-cols-1 mx-[-1rem] backdrop-blur-sm z-20 max-h-60 overflow-auto custom-scrollbar">
                {difficulties.map((item, index) => (
                  <div key={index}>
                  <div
                    
                    id={index}
                    className="flex flex-col justify-between bg-white m-2 mx-4 rounded-full w-[calc(100%-2rem)]"
                  >
                    <button
                      onClick={(event) => {
                        setSettings((prev) => ({
                          ...prev,
                          difficulty: difficulties[index]
                        }));
                        setDifficultyOpen(false);
                        event.preventDefault();
                      }}
                      className="rounded-md p-1 bg-[#DCA256] hover:scale-105 border-2 border-slate-700 w-full"
                    >
                      {item}
                    </button>
                  </div>
                  </div>
                ))}
              </div>
            )}
                    <div className="my-6 h-12 mx-1 lg:mx-3">
                        <button
                            type="submit"
                            className="bg-[#DE5399] border-slate-700 border-2 or-shadow rounded-md w-full h-12 text-black text-lg hover:bg-[#883c62]"
                        >
                            Host Game
                        </button>
                    </div>
                </form>
                <div className="my-6 mx-1 lg:mx-3 flex justify-end">
                    <button
                        onClick={(event) => {
                            // eslint-disable-next-line react/prop-types
                            props.handleClick()
                            event.preventDefault()
                        }}
                        className="bg-[#E0E0E0] border-slate-500 border-2 rounded-md w-32 h-8 text-black text-lg hover:bg-[#C0C0C0]"
                    >
                        Join Game
                    </button>
                </div>
            </div>
            <ToastContainer
                position="top-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </div>
    )
}

export default Host
