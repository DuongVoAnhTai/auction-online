import * as httpRequest from "@/utils/httpRequest";

export const createCategory = (data: any) =>
  httpRequest.post("categories", data);
export const updateCategory = (id: string, data: any) =>
  httpRequest.patch(`categories/${id}`, data);
export const deleteCategory = (id: string) =>
  httpRequest.del(`categories/${id}`);
