import axios from 'axios'
import PORT from '../config'

const baseURL = `http://127.0.0.1:${PORT}`;

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