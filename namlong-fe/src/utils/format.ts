/*
 * Copyright (c) Hải
 * Modified and maintained by Sloth Cry (2025)
 *
 * Permission is hereby granted to use, modify, and distribute this code
 * for educational and development purposes.
 */
export const formatCurrencyVND = (num: number) => {
  return new Intl.NumberFormat("vi-VN").format(num);
};
