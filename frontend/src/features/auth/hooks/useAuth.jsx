import { login,register,getMe,logOut } from "../service/auth.api";
import { AuthContext } from "../auth.context";
import { useContext, useEffect } from "react";


export const useAuth = ()=>{
    const context = useContext(AuthContext);
    const {user , setUser, loading , setLoading} = context;

    async function handleRegister(email,username,password){
        setLoading(true);
         
        const data = await register(email,username,password);
        setUser(data.user)
        console.log('====================================');
        console.log(data.user);
        console.log('====================================');

        setLoading(false);

    }


    async function handleLogin(email,password){
        setLoading(true);

        const data = await login(email,password);
        setUser(data.user)
        console.log('====================================');
        console.log(data.user);
        console.log('====================================');
        setLoading(false);

    


    }

    async function handleGetMe() {
        setLoading(true);
        const data = await getMe();
        setUser(data.user);
        console.log('====================================');
        console.log(data.user);
        console.log('====================================');

        setLoading(false)

    
        
    }


    async function handleLogOut() {
        setLoading(true);

        const data = await logOut();
        setUser(null)

        setLoading(false);

        }

        useEffect(()=>{
            handleGetMe();

        },[])



    return(
        {user,loading,handleGetMe,handleLogOut,handleLogin,handleRegister}
    )

}