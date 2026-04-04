import axios from "axios";

const httpRequest = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const get = async (path: string, option = {}) => {
  const response = await httpRequest.get(path, option);
  return response.data;
};

export const post = async (path: string, data = {}, option = {}) => {
  const response = await httpRequest.post(path, data, option);
  return response.data;
};

export const put = async (path: string, data = {}, option = {}) => {
  const response = await httpRequest.put(path, data, option);
  return response.data;
};

export const patch = async (path: string, data = {}, option = {}) => {
  const response = await httpRequest.patch(path, data, option);
  return response.data;
};

export const del = async (path: string, option = {}) => {
  const response = await httpRequest.delete(path, option);
  return response.data;
};

export default httpRequest;
