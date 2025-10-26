import React from 'react'
export function IncidentModal({ data, onClose }) {
  if (!data) return null
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }
  return (
    <div className="oee-modal-overlay show" onClick={handleOverlayClick}>
      <div className="oee-modal-content">
        <div className="oee-modal-header">
          <h2 className="oee-modal-title">Chi tiết thông tin sự cố</h2>
          <button className="oee-modal-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="oee-modal-body">
          <div className="oee-modal-field">
            <span className="oee-modal-label">Mã Thiết bị:</span>
            <span className="oee-modal-value">{data.equipmentCode || '-'}</span>
          </div>
          <div className="oee-modal-field">
            <span className="oee-modal-label">Tên Thiết bị:</span>
            <span className="oee-modal-value">{data.equipmentName || '-'}</span>
          </div>
          <div className="oee-modal-field">
            <span className="oee-modal-label">Công đoạn:</span>
            <span className="oee-modal-value">{data.stage || '-'}</span>
          </div>
          <div className="oee-modal-field">
            <span className="oee-modal-label">Dây chuyền:</span>
            <span className="oee-modal-value">{data.line || '-'}</span>
          </div>
          <div className="oee-modal-field highlight">
            <span className="oee-modal-label">Thời gian bắt đầu:</span>
            <span className="oee-modal-value">{data.startTime || '-'}</span>
          </div>
          <div className="oee-modal-field highlight">
            <span className="oee-modal-label">Thời lượng:</span>
            <span className="oee-modal-value">{data.hours ? `${data.hours} giờ` : '-'}</span>
          </div>
          <div className="oee-modal-field">
            <span className="oee-modal-label">Người đảm nhiệm:</span>
            <span className="oee-modal-value">{data.assignee || '-'}</span>
          </div>
          <div className="oee-modal-field">
            <span className="oee-modal-label">OEE:</span>
            <span className="oee-modal-value">{data.oee ? `${data.oee}%` : '-'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}