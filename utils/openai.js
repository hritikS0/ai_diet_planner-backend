import axios from "axios";

export const ollama = axios.create({
  baseURL: "http://localhost:11434/api",
  headers: { "Content-Type": "application/json" },
});
