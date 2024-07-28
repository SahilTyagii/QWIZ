import React from 'react'
import ReactDOM from 'react-dom/client'
// import App from './components/App'
import Layout from './Layout'
import Home from './components/Home/Home'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'
import Login from './components/Login/Login'
import Register from './components/Register/Register'
import Options from './components/Options/Options'
import Game from './components/Game/Game'
import ProtectedRoute from './components/ProtectedRoute'
import Profile from './components/Profile/Profile'
import Leaderboard from './components/Leaderboard/Leaderboard'
import Lobby from './components/Multiplayer/Lobby'
import Room from './components/Multiplayer/Room.jsx'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<Layout />}>
      <Route path='' element={<Home />}/>
      <Route path='login' element={<Login />}/>
      <Route path='register' element={<Register />}/>
      <Route element={<ProtectedRoute />}>
        <Route path='leaderboard' element={<Leaderboard />} />
        <Route path='options' element={<Options />}/>
        <Route path='game' element={<Game />}/>
        <Route path='lobby' element={<Lobby />} />
        <Route path='room' element={<Room />} />
        <Route path='profile' element={<Profile />}/>
      </Route>
    </Route>
  )
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router}/>
    </AuthProvider>
  </React.StrictMode>
)
