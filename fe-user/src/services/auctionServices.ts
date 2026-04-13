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

export const getCategories = async () => {
  try {
    const res = await httpRequest.get("categories");
    return res;
  } catch (error) {
    console.error("Lỗi lấy danh mục:", error);
    return [];
  }
};

export const getAuctionDetail = async (id: string) => {
  try {
    const res = await httpRequest.get(`auctions/${id}`);
    return res;
  } catch (error) {
    console.error("Lỗi lấy chi tiết đấu giá:", error);
    return null;
  }
};
