import React, { useState } from 'react'
import "../style/register.scss"
import "../components/FormGroup"
import FormGroup from '../components/FormGroup'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const Register = () => {
  const {user , loading,handleRegister} = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  


  async function handleSubmit(e){
    e.preventDefault()
    await handleRegister(email,username,password);
    navigate("/");

  }


  

  return (
    <main className="register-page">
      <div className="form-container">
        <h1>Register</h1>

        <form onSubmit={handleSubmit}>

         <FormGroup 
         onChange={(e)=>setUsername(e.target.value)}
         value={username}
         label="name" placeholder="name"/>

         <FormGroup
          onChange={(e)=>setEmail(e.target.value)}
          value={email}
          label="email" placeholder="email"/>

         <FormGroup 
          onChange={(e)=>setPassword(e.target.value)}
         value={password}
         label="password" placeholder="password"/>
          <button className='button' type='submit'>Register</button>
          <p>Already have account <Link to="/login">login</Link></p>
        </form>
      </div>
    </main>
  )
}

export default Register