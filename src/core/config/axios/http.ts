import axios from "axios";

const http = axios.create({
  baseURL: "https://dev.api.trustlesswork.com",
  timeout: 60000, // 1 minute
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer your_tw_token`,
  },
});

export default http;
