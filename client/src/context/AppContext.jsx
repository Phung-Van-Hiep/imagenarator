import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from 'axios'
import { useNavigate } from "react-router-dom";
export const AppContext = createContext();

const AppContextProvider = (props) => {
    const [user, setUser] = useState(null)
    const [showLogin, setShowLogin] = useState(false)
    const [token, setToken] = useState(localStorage.getItem('token'))
    const [credit, setCredit] = useState(0)
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const navigate = useNavigate()


    const purchaseCredit = async (amount, credits) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/user/payment-intent`,
                { amount, credits },
                { headers: { Authorization: `Bearer ${token}` }})

                // console.log(data);
                
            if (data.success) {
                // console.log(data.clientSecret);
                return data.clientSecret
            }else{
                toast.error(data.message)
                return null
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message)
        }
    }

    const loadCreditData  = async () => {
        try {
            const { data } = await axios.get(
                `${backendUrl}/api/user/credits`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (data.success) {
                setCredit(data.credits)
                setUser(data.user)
                console.log(data.credits);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message)
        }
    }

    const generateImage = async(prompt) =>{
        try {
            const {data} = await axios.post(`${backendUrl}/api/image/generate-image`,
            {prompt}, {headers : {Authorization: `Bearer ${token}`}}   
            )
            if(data.success){
                loadCreditData()
                return data.resultImage
            }
            else{
                toast.error(data.message)
                loadCreditData()
                if(data.creaditBalance ===0){
                    navigate('/buy')
                }
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const logout = () => {
        localStorage.removeItem('token')
        setToken('')
        setUser(null)
    }

    useEffect(() => {
        if (token) {
            loadCreditData()
        }
    }, [token])

    const value = {
        user, setUser, showLogin, setShowLogin, backendUrl,
        token, setToken, credit, setCredit, logout, generateImage, loadCreditData, 
        purchaseCredit
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider