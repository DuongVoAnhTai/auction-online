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

export const forgotPassword = async (email: string) => {
  try {
    const res = await httpRequest.post("auth/forgot-password", {
      email,
    });
    return res;
  } catch (error: any) {
    return {
      error: error.response?.data?.message || "Gửi yêu cầu thất bại",
    };
  }
};

export const resetPassword = async (otp: string, newPassword: string) => {
  try {
    const res = await httpRequest.post("auth/reset-password", {
      otp,
      newPassword,
    });
    return res;
  } catch (error: any) {
    return {
      error: error.response?.data?.message || "Đặt lại mật khẩu thất bại",
    };
  }
};
