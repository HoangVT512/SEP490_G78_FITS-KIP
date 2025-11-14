import React, { useState } from 'react';
import { CloseOutlined } from '@ant-design/icons';

export default function DownDetailsModal() {
  const [formData, setFormData] = useState({
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = () => {
    console.log('Form data:', formData);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.5)', padding: '12px' }}>
      <div style={{ width: '100%', maxWidth: '1050px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ backgroundColor: '#283652', color: 'white', padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: 'white', letterSpacing: '0.5px' }}>Chi Tiết Thời Gian Dừng Máy</h2>
          <button style={{ background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center' }}>
            <CloseOutlined />
          </button>
        </div>

        {/* Form Content with Scroll */}
        <div style={{ padding: '28px', maxHeight: '540px', overflowY: 'auto', backgroundColor: '#fafafa' }}>

          {/* Form fields No.2 */}
          <div className='No2' style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
            {/* No.2 - Record Number Box */}
            <div style={{ backgroundColor: '#9B9B9B', color: 'white', padding: '14px 18px', fontWeight: '700', marginBottom: '22px', borderRadius: '6px', fontSize: '15px', border: '2px solid #7A7A7A', textAlign: 'center', letterSpacing: '1px' }}>
              No.02
            </div>

            {/* Time Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 1fr', gap: '16px', alignItems: 'end', marginBottom: '18px' }}>
              <div>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#333', display: 'block', marginBottom: '8px' }}>Thời gian</label>
                <input
                  type="text"
                  name="timeStart"
                  value={formData.timeStart}
                  onChange={handleInputChange}
                  placeholder="HH:MM"
                  style={{ fontSize: '14px', padding: '10px 12px', height: '40px', width: '100%', border: '1px solid #D0D0D0', borderRadius: '6px', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ textAlign: 'center', paddingBottom: '8px' }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#888' }}>-</span>
              </div>
              <div>
                <input
                  type="text"
                  name="timeEnd"
                  value={formData.timeEnd}
                  onChange={handleInputChange}
                  placeholder="HH:MM"
                  style={{ fontSize: '14px', padding: '10px 12px', height: '40px', width: '100%', border: '1px solid #D0D0D0', borderRadius: '6px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Type */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#333', display: 'block', marginBottom: '8px' }}>Loại <span style={{ color: 'red' }}>*</span></label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                style={{ fontSize: '14px', padding: '10px 12px', height: '40px', width: '100%', border: '1px solid #D0D0D0', borderRadius: '6px', boxSizing: 'border-box' }}
              >
                <option>Dừng ngắn</option>
                <option>Dừng Dài</option>
                <option>Phế phẩm</option>
                <option>Vệ sinh đầu/cuối ca</option>
                <option>Đổi mã</option>
              </select>
            </div>

            {/* Equipment Code and Name */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#333', display: 'block', marginBottom: '8px' }}>Mã thiết bị <span style={{ color: 'red' }}>*</span></label>
                <select
                  name="equipmentCode"
                  value={formData.equipmentCode}
                  onChange={handleInputChange}
                  style={{ fontSize: '14px', padding: '10px 12px', height: '40px', width: '100%', border: '1px solid #D0D0D0', borderRadius: '6px', boxSizing: 'border-box' }}
                >
                  <option>MTB-001</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#333', display: 'block', marginBottom: '8px' }}>Tên thiết bị</label>
                <select
                  name="equipmentName"
                  value={formData.equipmentName}
                  onChange={handleInputChange}
                  style={{ fontSize: '14px', padding: '10px 12px', height: '40px', width: '100%', border: '1px solid #D0D0D0', borderRadius: '6px', boxSizing: 'border-box' }}
                >
                  <option>T-shirt Spring Cover</option>
                </select>
              </div>
            </div>

            {/* Stage and Line */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#333', display: 'block', marginBottom: '8px' }}>Công đoạn</label>
                <select
                  name="stage"
                  value={formData.stage}
                  onChange={handleInputChange}
                  style={{ fontSize: '14px', padding: '10px 12px', height: '40px', width: '100%', border: '1px solid #D0D0D0', borderRadius: '6px', boxSizing: 'border-box' }}
                >
                  <option>Dùng ngăn</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#333', display: 'block', marginBottom: '8px' }}>Line</label>
                <select
                  name="line"
                  value={formData.line}
                  onChange={handleInputChange}
                  style={{ fontSize: '14px', padding: '10px 12px', height: '40px', width: '100%', border: '1px solid #D0D0D0', borderRadius: '6px', boxSizing: 'border-box' }}
                >
                  <option>Line 1</option>
                  <option>Line 2</option>
                  <option>Line 3</option>
                </select>
              </div>
            </div>

            {/* Occurred time (Start) */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#333', display: 'block', marginBottom: '10px' }}>Thời gian xảy ra (Bắt đầu)</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                <div>
                  <input
                    type="text"
                    name="occurredDateStart"
                    value={formData.occurredDateStart}
                    onChange={handleInputChange}
                    placeholder="MM/DD"
                    style={{ fontSize: '13px', padding: '8px 10px', height: '36px', width: '100%', border: '1px solid #D0D0D0', borderRadius: '6px', boxSizing: 'border-box' }}
                  />
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '4px', textAlign: 'center', fontWeight: '500' }}>Ngày</div>
                </div>
                <div>
                  <input
                    type="text"
                    name="occurredTimeStart"
                    value={formData.occurredTimeStart}
                    onChange={handleInputChange}
                    placeholder="HH"
                    style={{ fontSize: '13px', padding: '8px 10px', height: '36px', width: '100%', border: '1px solid #D0D0D0', borderRadius: '6px', boxSizing: 'border-box' }}
                  />
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '4px', textAlign: 'center', fontWeight: '500' }}>Giờ</div>
                </div>
                <div>
                  <input
                    type="text"
                    name="occurredMinStart"
                    value={formData.occurredMinStart}
                    onChange={handleInputChange}
                    placeholder="MM"
                    style={{ fontSize: '13px', padding: '8px 10px', height: '36px', width: '100%', border: '1px solid #D0D0D0', borderRadius: '6px', boxSizing: 'border-box' }}
                  />
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '4px', textAlign: 'center', fontWeight: '500' }}>Phút</div>
                </div>
                <div>
                  <input
                    type="text"
                    name="occurredSecStart"
                    value={formData.occurredSecStart}
                    onChange={handleInputChange}
                    placeholder="SS"
                    style={{ fontSize: '13px', padding: '8px 10px', height: '36px', width: '100%', border: '1px solid #D0D0D0', borderRadius: '6px', boxSizing: 'border-box' }}
                  />
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '4px', textAlign: 'center', fontWeight: '500' }}>Giây</div>
                </div>
              </div>
            </div>

            {/* Occurred time (End) */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#333', display: 'block', marginBottom: '10px' }}>Thời gian xảy ra (Kết thúc)</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                <div>
                  <input
                    type="text"
                    name="occurredDateEnd"
                    value={formData.occurredDateEnd}
                    onChange={handleInputChange}
                    placeholder="MM/DD"
                    style={{ fontSize: '13px', padding: '8px 10px', height: '36px', width: '100%', border: '1px solid #D0D0D0', borderRadius: '6px', boxSizing: 'border-box' }}
                  />
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '4px', textAlign: 'center', fontWeight: '500' }}>Ngày</div>
                </div>
                <div>
                  <input
                    type="text"
                    name="occurredTimeEnd"
                    value={formData.occurredTimeEnd}
                    onChange={handleInputChange}
                    placeholder="HH"
                    style={{ fontSize: '13px', padding: '8px 10px', height: '36px', width: '100%', border: '1px solid #D0D0D0', borderRadius: '6px', boxSizing: 'border-box' }}
                  />
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '4px', textAlign: 'center', fontWeight: '500' }}>Giờ</div>
                </div>
                <div>
                  <input
                    type="text"
                    name="occurredMinEnd"
                    value={formData.occurredMinEnd}
                    onChange={handleInputChange}
                    placeholder="MM"
                    style={{ fontSize: '13px', padding: '8px 10px', height: '36px', width: '100%', border: '1px solid #D0D0D0', borderRadius: '6px', boxSizing: 'border-box' }}
                  />
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '4px', textAlign: 'center', fontWeight: '500' }}>Phút</div>
                </div>
                <div>
                  <input
                    type="text"
                    name="occurredSecEnd"
                    value={formData.occurredSecEnd}
                    onChange={handleInputChange}
                    placeholder="SS"
                    style={{ fontSize: '13px', padding: '8px 10px', height: '36px', width: '100%', border: '1px solid #D0D0D0', borderRadius: '6px', boxSizing: 'border-box' }}
                  />
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '4px', textAlign: 'center', fontWeight: '500' }}>Giây</div>
                </div>
              </div>
            </div>

            {/* Duration */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#333', display: 'block', marginBottom: '8px' }}>Thời lượng (phút)</label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                style={{ fontSize: '14px', padding: '10px 12px', height: '40px', width: '100%', border: '1px solid #D0D0D0', borderRadius: '6px', boxSizing: 'border-box' }}
              />
            </div>

            {/* Issuse */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#333', display: 'block', marginBottom: '8px' }}>Mô tả vấn đề</label>
              <textarea
                name="issue"
                value={formData.issue}
                onChange={handleInputChange}
                style={{ fontSize: '14px', padding: '10px 12px', width: '100%', border: '1px solid #D0D0D0', borderRadius: '6px', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif', resize: 'vertical' }}
                rows="3"
              />
            </div>

            {/* Reason */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#333', display: 'block', marginBottom: '8px' }}>Nguyên nhân</label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                style={{ fontSize: '14px', padding: '10px 12px', width: '100%', border: '1px solid #D0D0D0', borderRadius: '6px', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif', resize: 'vertical' }}
                rows="3"
              />
            </div>

            {/* Solution */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#333', display: 'block', marginBottom: '8px' }}>Giải pháp</label>
              <textarea
                name="solution"
                value={formData.solution}
                onChange={handleInputChange}
                style={{ fontSize: '14px', padding: '10px 12px', width: '100%', border: '1px solid #D0D0D0', borderRadius: '6px', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif', resize: 'vertical' }}
                rows="3"
              />
            </div>

            {/* Người báo cáo and Checkbox */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#333', display: 'block', marginBottom: '8px' }}>Người báo cáo</label>
                <input
                  type="text"
                  name="reporter"
                  value={formData.reporter}
                  onChange={handleInputChange}
                  style={{ fontSize: '14px', padding: '10px 12px', height: '40px', width: '100%', border: '1px solid #D0D0D0', borderRadius: '6px', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ paddingTop: '34px' }}>
                <label style={{ fontSize: '14px', fontWeight: '500', color: '#333', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="technicalSupport"
                    checked={formData.technicalSupport}
                    onChange={handleInputChange}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                  Cần hỗ trợ kỹ thuật
                </label>
              </div>
            </div>

            {/* Incident Images */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#333', display: 'block', marginBottom: '10px' }}>Hình ảnh sự cố</label>
              <div style={{ display: 'flex', gap: '14px' }}>
                <div style={{ width: '90px', height: '90px', border: '2px dashed #C4C4C4', borderRadius: '6px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#888', cursor: 'pointer', fontSize: '13px', fontWeight: '500', backgroundColor: '#fbfbfb', transition: 'all 0.2s' }}>
                  + Thêm
                </div>
              </div>
            </div>
          </div>


          {/* No.1 - Record Number Box */}
          <div style={{ backgroundColor: '#9B9B9B', color: 'white', padding: '14px 18px', fontWeight: '700', borderRadius: '6px', fontSize: '15px', border: '2px solid #7A7A7A', textAlign: 'center', marginTop: '24px', letterSpacing: '1px' }}>
            No.01
          </div>
        </div>

        {/* Buttons Footer */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', padding: '18px 28px', backgroundColor: '#E8E8E8', borderTop: '2px solid #D0D0D0' }}>
          <button style={{ padding: '10px 32px', fontSize: '14px', fontWeight: '600', height: '42px', borderRadius: '6px', border: '1px solid #999', backgroundColor: 'white', cursor: 'pointer', transition: 'all 0.2s' }}>
            Đóng
          </button>
          {/* <button onClick={handleSave} style={{ backgroundColor: '#1B7B8C', color: 'white', padding: '10px 32px', fontSize: '14px', fontWeight: '600', height: '42px', borderRadius: '6px', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
            Lưu tạm thời
          </button> */}
        </div>
      </div>
    </div>
  );
}