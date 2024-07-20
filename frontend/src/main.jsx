import React from 'react'
import ReactDOM from 'react-dom/client'
// import App from './components/App'
import Layout from './Layout'
import Home from './components/Home/Home'
import './index.css'
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'
import Login from './components/Login/Login'
import Register from './components/Register/Register'
import Options from './components/Options/Options'
import Game from './components/Game/Game'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<Layout />}>
      <Route path='' element={<Home />}/>
      <Route path='login' element={<Login />}/>
      <Route path='register' element={<Register />}/>
      <Route path='options' element={<Options />} />
      <Route path='game' element={<Game />} />
    </Route>
  )
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>,
)
