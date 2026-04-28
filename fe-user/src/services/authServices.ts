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

export const generate2FA = async () => {
  try {
    return await httpRequest.post("auth/2fa/generate");
  } catch (error: any) {
    return {
      error: error.response?.data?.message || "Không thể tạo mã QR",
    };
  }
};

export const turnOn2FA = async (otp: string, secret: string) => {
  try {
    return await httpRequest.post("auth/2fa/turn-on", { otp, secret });
  } catch (error: any) {
    return {
      error: error.response?.data?.message || "Kích hoạt 2FA thất bại",
    };
  }
};

export const turnOff2FA = async () => {
  try {
    return await httpRequest.post("auth/2fa/turn-off");
  } catch (error: any) {
    return {
      error: error.response?.data?.message || "Tắt 2FA thất bại",
    };
  }
};

export const loginWith2FA = async (userId: string, otp: string) => {
  try {
    return await httpRequest.post("auth/2fa/authenticate", { userId, otp });
  } catch (error: any) {
    return { error: "Mã OTP không chính xác" };
  }
};