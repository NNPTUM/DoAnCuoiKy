import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // URL của server Node.js
});

export default API;
