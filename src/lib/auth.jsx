import {createContext,useContext,useState,useEffect} from 'react';
import {api} from './api';
const Auth=createContext(null);
export function AuthProvider({children}){const [user,setUser]=useState(null);const [loading,setLoading]=useState(true);const [error,setError]=useState('');useEffect(()=>{api('/auth/me').then(d=>setUser(d.user)).catch(e=>setError(e.message)).finally(()=>setLoading(false));},[]);return <Auth.Provider value={{user,setUser,loading}}>{error&&<p role="alert" className="notice">Backend unavailable: {error} Start both servers with npm run dev.</p>}{children}</Auth.Provider>}
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth=()=>useContext(Auth);
