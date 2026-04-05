import * as httpRequest from "@/utils/httpRequest";

export const signup = async (
  email: string,
  fullName: string,
  password: string,
) => {
  try {
    const res = await httpRequest.post("auth/register", {
      email,
      fullName,
      password,
    });

    return res;
  } catch (error: any) {
    return {
      error: error.response?.data?.message || "Đăng ký thất bại",
      status: error.response?.status,
    };
  }
};

export const login = async (email: string, password: string) => {
  try {
    const res = await httpRequest.post("auth/login", {
      email,
      password,
    });
    return res;
  } catch (error: any) {
    return {
      error: error.response?.data?.message || "Đăng nhập thất bại",
    };
  }
};
