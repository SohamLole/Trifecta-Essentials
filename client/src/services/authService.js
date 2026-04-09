import api, { setStoredAuthToken } from "./api.js";

const persistAuth = (payload) => {
  setStoredAuthToken(payload.token);
  return payload.user;
};

export const signup = async (credentials) => {
  const response = await api.post("/auth/signup", credentials);
  return persistAuth(response.data.data);
};

export const login = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return persistAuth(response.data.data);
};

export const loginWithGoogle = async (credential) => {
  const response = await api.post("/auth/google", { credential });
  return persistAuth(response.data.data);
};

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data.data;
};

export const logoutUser = () => {
  setStoredAuthToken("");
};
