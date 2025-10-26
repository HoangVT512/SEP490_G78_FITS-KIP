import React, { useEffect, useState } from 'react'
export function Footer() {
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleString())
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date().toLocaleString())
    }, 60000)
    return () => clearInterval(interval)
  }, [])
  return (
    <div className="oee-footer">
      <p>Hệ thống Giám sát OEE Thời gian Thực - Công ty Cổ phần K.I.P Việt Nam</p>
      <p>
        Cập nhật lần cuối: <span>{lastUpdated}</span>
      </p>
    </div>
  )
}