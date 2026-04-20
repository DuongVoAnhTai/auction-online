import * as httpRequest from "@/utils/httpRequest";

export const getAuctions = async (query: any) => {
  try {
    const res = await httpRequest.get("auctions", { params: query });
    return res;
  } catch (error) {
    console.error("Lỗi lấy danh sách đấu giá:", error);
    return { data: [], meta: { currentPage: 1, totalPages: 1 } };
  }
};

export const getSearchSuggestions = async (search: string) => {
  try {
    const res = await httpRequest.get(`auctions/suggestions`, {
      params: { search },
    });
    return res;
  } catch (error) {
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

export const getMyAuctions = async () => {
  try {
    return await httpRequest.get("auctions/my-auctions");
  } catch (error) {
    console.error("Lỗi lấy danh sách sản phẩm đã đăng:", error);
    return [];
  }
};
