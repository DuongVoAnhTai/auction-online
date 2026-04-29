// Chuyển số thành chuỗi có dấu ngăn cách (ví dụ: 1000000 -> "1.000.000")
export const formatNumber = (value: number | string) => {
  if (!value) return "0";
  // Chuyển về dạng số nguyên để đấu giá cho dễ (thường VNĐ không để số lẻ)
  const number = Math.floor(Number(value));
  return number.toLocaleString("vi-VN");
};

// Chuyển chuỗi có dấu về lại số thuần túy (ví dụ: "1.000.000" -> 1000000)
export const parseNumber = (formattedValue: string) => {
  return Number(formattedValue.replace(/\D/g, ""));
};

export const maskName = (name: string) => {
  if (!name) return "****";
  const trimmedName = name.trim();

  // Nếu tên quá ngắn (1-2 ký tự) thì hiện ký tự đầu + ***
  if (trimmedName.length <= 2) {
    return trimmedName[0] + "***";
  }

  // Lấy ký tự đầu và ký tự cuối
  const firstChar = trimmedName[0];
  const lastChar = trimmedName[trimmedName.length - 1];

  return `${firstChar}***${lastChar}`;
};
