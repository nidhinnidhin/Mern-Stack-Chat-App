import axios from 'axios';

let token = '';

if (localStorage.getItem("userInfo")) {
    const userInfoString = localStorage.getItem("userInfo");
    const userInfo = JSON.parse(userInfoString);
    token = userInfo.token;
    console.log("token", token);
}

const PORT = process.env.REACT_APP_BACKEND_PORT;

const axiosInstance = axios.create({
    baseURL: `https://mern-stack-chat-app-sxw5.vercel.app`,
    headers: {'Content-Type': 'application/json'},
});

export const axiosReqWithToken = axios.create({
    baseURL: `https://mern-stack-chat-app-sxw5.vercel.app`,
    headers: { Authorization: `Bearer ${token}` }
});

export default axiosInstance;
