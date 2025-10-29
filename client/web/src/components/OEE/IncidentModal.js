import React from 'react'
export function IncidentModal({ data, onClose }) {
  if (!data) return null

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const hasMultipleIncidents = data.incidentCount > 1 && data.allIncidents?.length > 0

  return (
    <div className="oee-modal-overlay show" onClick={handleOverlayClick}>
      <div className="oee-modal-content">
        <div className="oee-modal-header">
          <h2 className="oee-modal-title">
            Chi tiết thông tin sự cố {hasMultipleIncidents && `(${data.incidentCount} sự cố)`}
          </h2>
          <button className="oee-modal-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="oee-modal-body">
          {!hasMultipleIncidents ? (
            <>
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
            </>
          ) : (
            <>
              <div className="oee-modal-field">
                <span className="oee-modal-label">Dây chuyền:</span>
                <span className="oee-modal-value">{data.line || '-'}</span>
              </div>
              <div className="oee-modal-field highlight">
                <span className="oee-modal-label">Tổng thời lượng:</span>
                <span className="oee-modal-value">{data.hours ? `${data.hours} giờ` : '-'}</span>
              </div>
              <div className="oee-modal-field">
                <span className="oee-modal-label">OEE:</span>
                <span className="oee-modal-value">{data.oee ? `${data.oee}%` : '-'}</span>
              </div>
              <div style={{ marginTop: '16px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#333' }}>
                  Danh sách sự cố:
                </h3>
                {data.allIncidents.map((incident, index) => (
                  <div key={index} style={{ 
                    marginBottom: '12px', 
                    padding: '12px', 
                    backgroundColor: '#f9f9f9', 
                    borderRadius: '6px',
                    borderLeft: '3px solid #1890ff'
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', fontSize: '12px' }}>
                      <strong>Thiết bị:</strong>
                      <span>{incident.equipmentName || incident.equipmentCode || '-'}</span>
                      
                      <strong>Công đoạn:</strong>
                      <span>{incident.stage || '-'}</span>
                      
                      <strong>Thời gian:</strong>
                      <span>{incident.startTime ? new Date(incident.startTime).toLocaleString('vi-VN') : '-'}</span>
                      
                      <strong>Thời lượng:</strong>
                      <span>{incident.duration ? `${incident.duration} phút` : '-'}</span>
                      
                      <strong>Trạng thái:</strong>
                      <span style={{ 
                        padding: '2px 8px', 
                        borderRadius: '4px', 
                        backgroundColor: incident.status === 'Hoàn thành' ? '#52c41a' : '#faad14',
                        color: 'white',
                        fontSize: '11px'
                      }}>
                        {incident.status || '-'}
                      </span>
                      
                      <strong>Người xử lý:</strong>
                      <span>{incident.assignedTo || '-'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}