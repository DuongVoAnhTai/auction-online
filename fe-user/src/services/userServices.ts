import * as httpRequest from "@/utils/httpRequest";

export const findByEmail = async (email: string) => {
  return await httpRequest.get("users/email", { email });
};

export const getProfile = async () => {
  try {
    return await httpRequest.get("users/profile");
  } catch (error) {
    return null;
  }
};

export const updateProfile = async (data: {
  fullName?: string;
  avatarUrl?: string;
}) => {
  try {
    return await httpRequest.patch("users/update", data);
  } catch (error) {
    return { error: "Cập nhật thất bại" };
  }
};

export const uploadAvatar = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    return await httpRequest.post("users/upload-avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  } catch (error) {
    return { error: "Upload ảnh thất bại" };
  }
};
