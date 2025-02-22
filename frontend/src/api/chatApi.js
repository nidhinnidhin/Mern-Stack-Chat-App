import axios from 'axios'
import PORT from '../config'

const baseURL = `https://mern-stack-chat-app-wu4f.onrender.com`;

export const fetchChats = async () => {
    try{
        const response = await axios.get(`${baseURL}/api/chat`);
        return response.data
    }
    catch(error){
        console.error("Something went wrong while fetching chats", error);
        throw error;
    }
};