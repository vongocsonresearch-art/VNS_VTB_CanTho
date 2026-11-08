/**
 * Utilities for formatting VND currency, loan amortization, and banking hours
 */

export const formatVND = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('vi-VN').format(num);
};

export interface BranchOpenStatus {
  isOpen: boolean;
  statusText: string;
}

/**
 * Checks VietinBank branch operating hours:
 * Mon-Fri: Morning 07:30 - 11:30 | Afternoon 13:00 - 16:30
 * Sat-Sun: Closed
 */
export const isBranchOpenNow = (): BranchOpenStatus => {
  const now = new Date();
  const day = now.getDay(); // 0 is Sunday, 6 is Saturday
  if (day === 0 || day === 6) {
    return {
      isOpen: false,
      statusText: 'Đang ngoài giờ giao dịch (Thứ 7 & CN nghỉ)'
    };
  }

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentMinutes = hours * 60 + minutes;

  const morningStart = 7 * 60 + 30; // 07:30
  const morningEnd = 11 * 60 + 30;  // 11:30
  const afternoonStart = 13 * 60;   // 13:00
  const afternoonEnd = 16 * 60 + 30;// 16:30

  if (currentMinutes >= morningStart && currentMinutes <= morningEnd) {
    return {
      isOpen: true,
      statusText: 'Đang mở cửa phục vụ (Phiên sáng: 07:30 - 11:30)'
    };
  }

  if (currentMinutes >= afternoonStart && currentMinutes <= afternoonEnd) {
    return {
      isOpen: true,
      statusText: 'Đang mở cửa phục vụ (Phiên chiều: 13:00 - 16:30)'
    };
  }

  if (currentMinutes > morningEnd && currentMinutes < afternoonStart) {
    return {
      isOpen: false,
      statusText: 'Nghỉ trưa (Mở lại lúc 13:00)'
    };
  }

  return {
    isOpen: false,
    statusText: 'Đang ngoài giờ giao dịch (Mở cửa lúc 07:30 sáng mai)'
  };
};
