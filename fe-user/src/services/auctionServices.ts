import * as httpRequest from "@/utils/httpRequest";

export const getAuctions = async (query: any) => {
  try {
    const res = await httpRequest.get("auctions", { params: query });
    return res;
  } catch (error) {
    console.error("Lỗi lấy danh sách đấu giá:", error);
    return [];
  }
};
