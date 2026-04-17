import * as httpRequest from "@/utils/httpRequest";

export const getMyNotifications = async () => {
  try {
    const res = await httpRequest.get("notifications");
    return res;
  } catch (error) {
    return [];
  }
};

export const markAllRead = async () => {
  try {
    return await httpRequest.patch("notifications/mark-all-read");
  } catch (error) {
    return null;
  }
};
