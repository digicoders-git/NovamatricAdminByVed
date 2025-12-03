import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;
const api = axios.create({
  baseURL:API_URL,
});

// ------- ADMIN LOGIN ------
export const loginAdmin = async (username, password) => {
  return api.post("/api/admin/login", { username, password });
};

// ------- RESPONDENTS -------
export const getResponses = async () => {
  return api.get("/responses");
};

// ------- SURVEYS -------
export const createSurvey = async (data) => {
  return api.post("/survey", data);
};

export const getAllSurveys = async () => {
  return api.get("/survey");
};

export const getSurveyById = async (id) => {
  return api.get(`/survey/${id}`);
};

export default api;
