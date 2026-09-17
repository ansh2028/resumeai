import { useContext } from "react";
import{AuthContext} from "../auth.context.jsx"
import{login,register,logout,getMe} from '../services/auth.api'

export const useAuth = () => {
    const context=useContext(AuthContext);
    const {user,setuser,loading,setloading} = context;

    const handlelogin = async (credentialsOrEmail, maybePassword) => {
        setloading(true);
        try {
            const email = typeof credentialsOrEmail === 'object' ? credentialsOrEmail.email : credentialsOrEmail;
            const password = typeof credentialsOrEmail === 'object' ? credentialsOrEmail.password : maybePassword;
            const response = await login(email, password);
            setuser(response?.user ?? null);
            return response;
        } catch (error) {
            throw error;
        } finally {
            setloading(false);
        }
    }

    const handleregister = async (userOrUsername, maybeEmail, maybePassword) => {
        setloading(true);
        try {
            const username = typeof userOrUsername === 'object' ? userOrUsername.username : userOrUsername;
            const email = typeof userOrUsername === 'object' ? userOrUsername.email : maybeEmail;
            const password = typeof userOrUsername === 'object' ? userOrUsername.password : maybePassword;
            const response = await register(username, email, password);
            setuser(response?.user ?? null);
            return response;
        } catch (error) {
            throw error;
        } finally {
            setloading(false);
        }
    }

    const handlelogout = async () => {
        setloading(true);
        try {
            const response = await logout();
            setuser(null);
            return response;
        } catch (error) {
            throw error;
        } finally {
            setloading(false);
        }
    }

    const handlegetMe = async () => {
        setloading(true);
        try {
            const response = await getMe();
            setuser(response?.user ?? null);
            return response;
        } catch (error) {
            throw error;
        } finally {
            setloading(false);
        }
    }

    return {
        user,
        loading,
        handleRegister: handleregister,
        handleregister,
        handlelogin,
        handlelogout,
        handlegetMe
    }
}
