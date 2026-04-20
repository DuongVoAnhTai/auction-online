import * as httpRequest from "@/utils/httpRequest";

export const findByEmail = async (email: string) => {
  return await httpRequest.get("users/email", { email });
};
