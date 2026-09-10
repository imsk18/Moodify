import React,{useState} from 'react'
import "../style/login.scss"
import "../components/FormGroup"
import FormGroup from '../components/FormGroup'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const {loading , handleLogin} = useAuth()
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate()

  async function handleSubmit(e){
    e.preventDefault()
    await handleLogin(email,password);
    navigate("/")
    

  }
  return (
    <main className='login-page'>

      <div className="form-container">
        <h1>login</h1>

        <form onSubmit={handleSubmit}>
         <FormGroup
         value={email}
         onChange={(e)=> setEmail(e.target.value)}
          label="email" placeholder="email"/>

         <FormGroup
         value={password}
         onChange={(e)=>setPassword(e.target.value)}
          label="password" placeholder="password"/>

          <button className='button' type='submit'>Login</button>
          <p>Don't have an account <Link to="/register">register</Link></p>
        </form>
      </div>

    </main>
  )
}

export default Login