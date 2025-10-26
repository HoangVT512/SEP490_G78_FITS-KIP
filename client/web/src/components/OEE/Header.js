import React from 'react'
export function Header({ selectedDate, onDateChange }) {
  const today = new Date().toISOString().split('T')[0]
  return (
    <div className="oee-header">
      <h1>Công ty Cổ phần K.I.P Việt Nam - Bố trí Kiến trúc Nhà máy</h1>
      <p>
        Thành lập ngày 11 tháng 1 năm 1967 - Giám sát Hiệu suất OEE trên các Nhà máy Cơ khí, Lắp ráp và Dây
      </p>
      <div className="oee-date-filter">
        <label htmlFor="date-picker">Ngày:</label>
        <input
          type="date"
          id="date-picker"
          value={selectedDate}
          max={today}
          onChange={(e) => onDateChange(e.target.value)}
        />
      </div>
    </div>
  )
}