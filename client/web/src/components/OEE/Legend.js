import React from 'react'
export function Legend() {
  return (
    <div className="oee-legend">
      <div className="oee-legend-item">
        <div className="oee-legend-color" style={{ backgroundColor: '#4CAF50' }}></div>
        <span className="oee-legend-text">Xanh lá: OEE &gt; 85%</span>
      </div>
      <div className="oee-legend-item">
        <div className="oee-legend-color" style={{ backgroundColor: '#FFEB3B' }}></div>
        <span className="oee-legend-text">Vàng: OEE (70 - 85)%</span>
      </div>
      <div className="oee-legend-item">
        <div className="oee-legend-color" style={{ backgroundColor: '#F44336' }}></div>
        <span className="oee-legend-text">Đỏ: OEE &lt; 70%</span>
      </div>
      <div className="oee-legend-item">
        <div className="oee-legend-color" style={{ backgroundColor: '#FFFFFF' }}></div>
        <span className="oee-legend-text">Trắng: Không sản xuất</span>
      </div>
      <div className="oee-legend-item">
        <div className="oee-legend-color" style={{ backgroundColor: '#9E9E9E' }}></div>
        <span className="oee-legend-text">Xám: Khu vực không sản xuất (Văn phòng, v.v.)</span>
      </div>
      <div className="oee-legend-item">
        <div className="oee-legend-color incident-droplet"></div>
        <span className="oee-legend-text">Sự cố thiết bị</span>
      </div>
    </div>
  )
}