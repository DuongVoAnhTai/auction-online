import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Thiết lập một timer để cập nhật giá trị sau khoảng 'delay'
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Nếu giá trị 'value' thay đổi trước khi hết 'delay', xóa timer cũ đi
    // Đây là mấu chốt: nó ngăn chặn việc cập nhật liên tục
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
