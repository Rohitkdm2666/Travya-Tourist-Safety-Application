import { useState } from 'react'
import Navbar from './pages/navbar.jsx'
import Home from './pages/home.jsx'
import HomeScreen from './pages/apphome.jsx'
import PoliceDashboard from './pages/policedashboard.jsx'
import ServicesHub from './pages/services.jsx'
import EFIRs from './pages/efirs.jsx'
import AIChat from './pages/aichat.jsx'
import Profile from './pages/profile.jsx'
import PublicDashboard from './pages/publicdashboard.jsx'


import { createBrowserRouter, RouterProvider } from 'react-router-dom'


const router = createBrowserRouter([
  { path: '/', element: <Home/> },
  { path: '/home', element: <Home/> },
  { path: '/apphome', element: <HomeScreen/> },
  { path: '/police', element: <PoliceDashboard/> },
  { path: '/efirs', element: <EFIRs/> },
  { path: '/services', element: <ServicesHub/> },
  { path: '/aichat', element: <AIChat/> },
  { path: '/profile', element: <Profile/> },
  {path:"/public",element:<PublicDashboard/>}
])


function App() {
  
  return (
    
    <div className="App">
    <RouterProvider router={router} />
  </div>
    
  )
}

export default App
