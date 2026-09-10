import React from 'react'
import { RouterProvider } from 'react-router-dom'
import {router} from './app.Routes'
import "./features/auth/shared/styles/global.scss"
import { AuthProvider } from './features/auth/auth.context'
// import FaceExpression from './features/Expression/FaceExpression'

const App = () => {
  return (
    // <FaceExpression/>
    <AuthProvider>
      <RouterProvider router= {router}/>
    </AuthProvider>
    

  )
}

export default App;