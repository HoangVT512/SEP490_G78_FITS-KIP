import React, { useState, useEffect } from 'react';

export function Header({ selectedDate, onDateChange }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    // Cập nhật ngày hiện tại mỗi phút để tránh lag
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000); // 1 phút
    return () => clearInterval(interval);
  }, []);

  // Tính ngày tối đa ở múi giờ địa phương (Việt Nam)
  const today = new Date(currentDate.getTime() - (currentDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

  return (
    <div className="oee-header">
      <h1>Công ty Cổ phần K.I.P Việt Nam - Bố trí Kiến trúc Nhà máy</h1>
      <p>Thành lập ngày 11 tháng 1 năm 1967 - Giám sát Hiệu suất OEE trên các Nhà máy Cơ khí, Lắp ráp và Dây</p>
      <div className="oee-date-filter">
        <label htmlFor="date-picker">Ngày:</label>
        <input
          type="date"
          id="date-picker"
          value={selectedDate}
          max={today}  // Giờ sẽ luôn là ngày hiện tại thực tế
          onChange={(e) => onDateChange(e.target.value)}
        />
      </div>
    </div>
  );
}