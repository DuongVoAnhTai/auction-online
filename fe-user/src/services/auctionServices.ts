import * as httpRequest from "@/utils/httpRequest";

export const getActiveAuctions = async () => {
  try {
    const res = await httpRequest.get("auctions");
    return res;
  } catch (error) {
    console.error("Lỗi lấy danh sách đấu giá:", error);
    return [];
  }
};
