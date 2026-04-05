import axios from "axios";
import Cookies from "js-cookie";

const httpRequest = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  withCredentials: true,
});

// INTERCEPTOR: Chạy trước mỗi khi gửi request
httpRequest.interceptors.request.use(
  (config) => {
    const token = Cookies.get("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

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
