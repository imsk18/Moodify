import {createBrowserRouter} from 'react-router-dom'
import Login from './features/auth/pages/Login'
import Register from './features/auth/pages/Register'
import Protected from './features/auth/components/Protected'
import Home from './features/Home/pages/Home'

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Protected>
            <Home/>
            </Protected>
    },
  
    {
        path: "/register",
        element: <Register/>
    },
    {
        path: "/login",
        element: <Login/>
    }
])

