import React, { useState, useEffect, useMemo } from 'react';
import { Form, Input, Select, DatePicker, Button, Table, Modal, Card, Row, Col, Typography, Tabs } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import '../../styles/pages/EFormSystem.css';
import lineService from '../../services/lineService';
import productionOutputService from '../../services/productionOutputService';
import authService from '../../services/authService';
import { incidentService } from '../../services/incidentService';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Function to calculate OEE using API
const calculateAndUpdateOEE = async (record, shift) => {
  try {
    const requestData = {
      lineId: parseInt(selectedLine),
      date: dayjs(currentFormData.date, 'DD/MM/YYYY').format('YYYY-MM-DD'),
      shiftId: shift,
      slotTime: record.time,
      targetAmount: parseInt(record.targetAmount),
      resultAmount: parseInt(record.resultAmount)
    };

    const response = await productionOutputService.calculateOEE(requestData);

    if (response.success) {
      // Update the OEE value in the shift data
      const currentShiftData = getCurrentShiftData();
      const updatedShiftData = currentShiftData.map(item =>
        item.key === record.key
          ? { ...item, oee: response.data.oeePercentage.toString() }
          : item
      );
      setCurrentShiftData(updatedShiftData);
    }
  } catch (error) {
    console.error('Lỗi khi tính toán OEE:', error);
    // You might want to show an error notification to the user
  }
}; const EFormSystem = () => {
  const [searchForm] = Form.useForm();
  const [productionForm] = Form.useForm();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFormData, setSelectedFormData] = useState(null);
  const [activeShift, setActiveShift] = useState('1');

  const [currentEditingFormId, setCurrentEditingFormId] = useState(null);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');

  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const [showSuccessPage, setShowSuccessPage] = useState(false);

  // State for selected criteria
  const [selectedLine, setSelectedLine] = useState(null);
  const [selectedFormType, setSelectedFormType] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  // State for lines and loading
  const [lines, setLines] = useState([]);
  const [loadingLines, setLoadingLines] = useState(false);

  // State for production outputs
  const [productionOutputs, setProductionOutputs] = useState([]);
  const [loadingOutputs, setLoadingOutputs] = useState(false);
  const [outputsLoaded, setOutputsLoaded] = useState(false);
  const [currentLoadedDate, setCurrentLoadedDate] = useState(null); // Track which date the data is loaded for

  // State for incidents 
  const [incidents, setIncidents] = useState([]);
  const [loadingIncidents, setLoadingIncidents] = useState(false);

  // Thêm state cho validation modal
  const [validationModalVisible, setValidationModalVisible] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  // Generate preview STT for form title
  const previewStt = useMemo(() => {
    if (selectedLine && selectedFormType && selectedDate) {
      return String(Math.floor(Math.random() * 100000000)).padStart(8, '0');
    }
    return '';
  }, [selectedLine, selectedFormType, selectedDate]);

  // Default shift data for new drafts
  const defaultShift1Data = [
    { key: '1-1', time: '07:00 - 08:00', loadingTime: '60', targetAmount: '', resultAmount: '', oee: '', downDetails: '' },
    { key: '1-2', time: '08:00 - 09:00', loadingTime: '60', targetAmount: '', resultAmount: '', oee: '', downDetails: '' },
    { key: '1-3', time: '09:00 - 10:00', loadingTime: '60', targetAmount: '', resultAmount: '', oee: '', downDetails: '' },
    { key: '1-4', time: '10:00 - 11:00', loadingTime: '60', targetAmount: '', resultAmount: '', oee: '', downDetails: '' },
    { key: '1-5', time: '11:00 - 12:00', loadingTime: '30', targetAmount: '', resultAmount: '', oee: '', downDetails: '' },
    { key: '1-6', time: '12:00 - 13:00', loadingTime: '60', targetAmount: '', resultAmount: '', oee: '', downDetails: '' },
    { key: '1-7', time: '13:00 - 14:00', loadingTime: '60', targetAmount: '', resultAmount: '', oee: '', downDetails: '' },
    { key: '1-8', time: '14:00 - 15:00', loadingTime: '60', targetAmount: '', resultAmount: '', oee: '', downDetails: '' },
  ];

  const defaultShift2Data = [
    { key: '2-1', time: '15:00 - 16:00', loadingTime: '60', targetAmount: '', resultAmount: '', oee: '', downDetails: '' },
    { key: '2-2', time: '16:00 - 17:00', loadingTime: '60', targetAmount: '', resultAmount: '', oee: '', downDetails: '' },
    { key: '2-3', time: '17:00 - 18:00', loadingTime: '60', targetAmount: '', resultAmount: '', oee: '', downDetails: '' },
    { key: '2-4', time: '18:00 - 19:00', loadingTime: '60', targetAmount: '', resultAmount: '', oee: '', downDetails: '' },
    { key: '2-5', time: '19:00 - 20:00', loadingTime: '30', targetAmount: '', resultAmount: '', oee: '', downDetails: '' },
    { key: '2-6', time: '20:00 - 21:00', loadingTime: '60', targetAmount: '', resultAmount: '', oee: '', downDetails: '' },
    { key: '2-7', time: '21:00 - 22:00', loadingTime: '60', targetAmount: '', resultAmount: '', oee: '', downDetails: '' },
    { key: '2-8', time: '22:00 - 23:00', loadingTime: '60', targetAmount: '', resultAmount: '', oee: '', downDetails: '' },
  ];


  // Thêm hàm normalizeSlotTime ở cấp độ component (trước slotTimeMappings)
  const normalizeSlotTime = (slotTime) => {
    if (!slotTime) return '';
    // Chuẩn hóa: loại bỏ space, chuyển tất cả dấu gạch về -, format: HH:MM-HH:MM
    const cleaned = slotTime
      .replace(/\s+/g, '')           // Remove spaces
      .replace(/[–—−]/g, '-')         // Convert all dashes to regular dash
      .replace(/h/g, ':00');          // Convert 'h' to ':00'

    const parts = cleaned.split('-');
    if (parts.length === 2) {
      const start = parts[0].padStart(5, '0'); // "7:00" -> "07:00"
      const end = parts[1].padStart(5, '0');
      return `${start}-${end}`;
    }
    return cleaned;
  };

  // Slot time mappings for API data conversion - UPDATED KEYS AND EXTENDED SLOTS
  const slotTimeMappings = useMemo(() => {
    const mappings = {};

    const shift1Times = [
      '07:00 - 08:00', '08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00',
      '11:00 - 12:00', '12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00'
    ];

    const shift2Times = [
      '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00', '18:00 - 19:00',
      '19:00 - 20:00', '20:00 - 21:00', '21:00 - 22:00', '22:00 - 23:00'
    ];

    // Generate all possible formats for standard slots
    [...shift1Times, ...shift2Times].forEach(time => {
      const [start, end] = time.split(' - ');
      const shiftId = shift1Times.includes(time) ? 1 : 2;
      const index = shiftId === 1 ? shift1Times.indexOf(time) : shift2Times.indexOf(time);
      const key = `${shiftId}-${index + 1}`;
      const mapping = { key, time, shiftId };

      // Register all possible formats
      mappings[time] = mapping;                          // "07:00 - 08:00"
      mappings[`${start}-${end}`] = mapping;             // "07:00-08:00"
      mappings[`${start}–${end}`] = mapping;             // "07:00–08:00" (en-dash)
      mappings[`${start}—${end}`] = mapping;             // "07:00—08:00" (em-dash)
      mappings[`${start}−${end}`] = mapping;             // "07:00−08:00" (minus)

      const startHour = start.split(':')[0];
      const endHour = end.split(':')[0];
      mappings[`${startHour}h-${endHour}h`] = mapping;   // "7h-8h"
    });

    // Extended slots (for non-standard times in database)
    const extendedSlots = [
      { api: '06:00–07:00', map: '07:00 - 08:00', shift: 1, key: '1' },
      { api: '07:00–08:30', map: '07:00 - 08:00', shift: 1, key: '1' },
      { api: '11:30–12:30', map: '11:00 - 12:00', shift: 1, key: '5' },  // ✅ Map 11:30-12:30 to 11:00-12:00
      { api: '14:00–15:00', map: '14:00 - 15:00', shift: 1, key: '8' },
      { api: '14:00–15:30', map: '14:00 - 15:00', shift: 1, key: '8' },
      { api: '15:00–16:30', map: '15:00 - 16:00', shift: 2, key: '1' },
      { api: '22:00–23:00', map: '22:00 - 23:00', shift: 2, key: '8' },
      { api: '22:00–23:30', map: '22:00 - 23:00', shift: 2, key: '8' },
    ];

    extendedSlots.forEach(slot => {
      mappings[slot.api] = { key: slot.key, time: slot.map, shiftId: slot.shift };
    });

    // Add flexible lookup function
    mappings.lookup = (slotTime) => {
      if (!slotTime) return null;

      // Direct lookup first
      if (mappings[slotTime]) {
        return mappings[slotTime];
      }

      // Normalized lookup
      const normalized = normalizeSlotTime(slotTime);
      console.log('Đã chuẩn hóa khung thời gian :', slotTime, '->', normalized);

      // Find by normalized format
      for (const key in mappings) {
        if (typeof mappings[key] === 'object' && mappings[key].time) {
          const normalizedKey = normalizeSlotTime(key);
          if (normalizedKey === normalized) {
            console.log('Đã tìm thấy theo định dạng chuẩn hóa:', mappings[key]);
            return mappings[key];
          }
        }
      }

      // Try matching by start time
      const startTime = slotTime.split(/[-–—−]/)[0].trim().split(':')[0];
      for (const key in mappings) {
        if (typeof mappings[key] === 'object' && mappings[key].time) {
          const keyStart = mappings[key].time.split(' - ')[0].split(':')[0];
          if (keyStart === startTime) {
            console.log('Đã tìm thấy theo thời gian bắt đầu:', mappings[key]);
            return mappings[key];
          }
        }
      }

      console.warn('❌ Không tìm thấy ánh xạ cho thời gian slot:', slotTime);
      return null;
    };

    return mappings;
  }, []);

  // Danh sách các form đã lưu
  const [savedForms, setSavedForms] = useState([]);

  // Dữ liệu form hiện tại đang được edit
  const [currentFormData, setCurrentFormData] = useState({
    line: '',
    process: 'Lắp Sleeve S/A',
    date: dayjs().format('DD/MM/YYYY'),
    actualCycleTime: '0.00',  // ✅ THÊM
    idealCycleTime: '0.00'     // ✅ THÊM
  });

  // Data cho 2 ca
  const [shift1Data, setShift1Data] = useState([...defaultShift1Data]);
  const [shift2Data, setShift2Data] = useState([...defaultShift2Data]);

  // Load lines assigned to current user on mount
  useEffect(() => {
    const loadLines = async () => {
      setLoadingLines(true);
      try {
        const currentUser = authService.getStoredUser();
        if (!currentUser || !currentUser.id) {
          console.error('Không người dùng nào được tìm thấy, hoặc mã người dùng bị bỏ lỡ');
          setLines([]);
          return;
        }

        const data = await lineService.getLinesByUser(currentUser.id);
        setLines(data);
      } catch (error) {
        console.error('Tải danh sách dây chuyền bị lỗi:', error);
        setLines([]);
      } finally {
        setLoadingLines(false);
      }
    };
    loadLines();
  }, []);

  // Load production outputs when line and date are selected - FIXED VERSION
  useEffect(() => {
    const loadProductionOutputs = async () => {
      if (!selectedLine || !selectedDate) {
        // CRITICAL: Reset productionOutputs immediately when date changes to prevent race conditions
        setProductionOutputs([]); // Đặt thành mảng rỗng thay vì cố gắng map dataArray (không tồn tại)
        setOutputsLoaded(false);
        setCurrentLoadedDate(null);
        // Reset về default data khi không có line hoặc date
        setShift1Data([...defaultShift1Data]);
        setShift2Data([...defaultShift2Data]);
        return;
      }

      // CRITICAL: Reset productionOutputs immediately when date changes to prevent race conditions
      setProductionOutputs([]);
      setCurrentLoadedDate(null);

      // CRITICAL: Reset shift data trước khi load data mới
      console.log('Đang cài đặt dữ liệu ca trước khi tải dữ liệu mới...');
      setShift1Data([...defaultShift1Data]);
      setShift2Data([...defaultShift2Data]);

      setLoadingOutputs(true);

      // Khai báo formattedDate ở đây để có phạm vi trong cả try và catch
      let formattedDate;
      try {
        formattedDate = dayjs(selectedDate).format('YYYY-MM-DD');
        console.log('Đang tải sản lượng sản xuất cho chuyền:', selectedLine, 'ngày:', formattedDate);

        const response = await productionOutputService.getByLineAndDate(selectedLine, formattedDate);
        console.log('Đã tải sản lượng sản xuất:', response);

        // Extract data array from response
        const dataArray = response?.data || [];

        if (dataArray.length > 0) {
          console.log('Tìm thấy', dataArray.length, 'sản lượng sản xuất');
          setProductionOutputs(dataArray.map(item => ({
            ...item,
            id: item.outputId,
            slotTime: normalizeSlotTime(item.slotTime) // Bây giờ có thể truy cập
          })));
        } else {
          console.log('Không tìm thấy sản lượng sản xuất cho ngày này');
          setProductionOutputs([]);
        }

        setOutputsLoaded(true);
        setCurrentLoadedDate(formattedDate); // Mark that data is loaded for this specific date
      } catch (error) {
        console.error('Tải dữ liệu sản xuất bị lỗi:', error);
        setProductionOutputs([]);
        setOutputsLoaded(true);
        setCurrentLoadedDate(formattedDate); // Bây giờ có thể truy cập
      } finally {
        setLoadingOutputs(false);
      }
    };

    loadProductionOutputs();
  }, [selectedLine, selectedDate]); // Chỉ phụ thuộc vào selectedLine và selectedDate


  // Load incidents when line and date are selected
  useEffect(() => {
    const loadIncidents = async () => {
      if (!selectedLine || !selectedDate) {
        setIncidents([]);
        return;
      }

      setLoadingIncidents(true);
      try {
        const formattedDate = dayjs(selectedDate).format('DD/MM/YYYY');
        console.log('Đang tải những sự cố cho dây chuyền:', selectedLine, 'ngày:', formattedDate);
        const response = await incidentService.getIncidentsByLineAndDate(selectedLine, formattedDate);
        console.log('Đã tải danh sách sự cố:', response);
        setIncidents(response);
      } catch (error) {
        console.error('Tải những sự cố bị lỗi:', error);
        setIncidents([]);
      } finally {
        setLoadingIncidents(false);
      }
    };

    loadIncidents();
  }, [selectedLine, selectedDate]);

  // Calculate cycle times based on production data
  const calculateCycleTimes = (shift1Data, shift2Data) => {
    let totalLoadingTime = 0;
    let totalDowntime = 0;
    let totalResultAmount = 0;

    // Calculate for shift 1
    shift1Data.forEach(slot => {
      if (slot.resultAmount && parseInt(slot.resultAmount) > 0) {
        const loadingTime = parseInt(slot.loadingTime) || 0;
        totalLoadingTime += loadingTime;
        totalResultAmount += parseInt(slot.resultAmount);

        // Calculate actual downtime from downDetails (FIXED: Use exact downtime per slot)
        if (Array.isArray(slot.downDetails) && slot.downDetails.length > 0) {
          const slotDowntime = slot.downDetails.reduce((sum, detail) =>
            sum + (parseFloat(detail.minutes) || 0), 0
          );
          totalDowntime += slotDowntime;
        }
      }
    });

    // Calculate for shift 2
    shift2Data.forEach(slot => {
      if (slot.resultAmount && parseInt(slot.resultAmount) > 0) {
        const loadingTime = parseInt(slot.loadingTime) || 0;
        totalLoadingTime += loadingTime;
        totalResultAmount += parseInt(slot.resultAmount);

        // Calculate actual downtime from downDetails (FIXED: Use exact downtime per slot)
        if (Array.isArray(slot.downDetails) && slot.downDetails.length > 0) {
          const slotDowntime = slot.downDetails.reduce((sum, detail) =>
            sum + (parseFloat(detail.minutes) || 0), 0
          );
          totalDowntime += slotDowntime;
        }
      }
    });

    if (totalResultAmount > 0) {
      const operatingTime = totalLoadingTime - totalDowntime;
      const actualCycleTime = (operatingTime * 60) / totalResultAmount;
      const idealCycleTime = (totalLoadingTime * 60) / totalResultAmount;

      return {
        actual: actualCycleTime.toFixed(2),
        ideal: idealCycleTime.toFixed(2)
      };
    }

    return { actual: '0.00', ideal: '0.00' };
  };

  // Function to calculate OEE using API
  const calculateAndUpdateOEE = async (record, shift) => {
    try {
      const requestData = {
        lineId: parseInt(selectedLine),
        date: dayjs(currentFormData.date, 'DD/MM/YYYY').format('YYYY-MM-DD'),
        shiftId: shift,
        slotTime: record.time,
        loadingTime: parseInt(record.loadingTime) || 60, // Thêm loadingTime
        targetAmount: parseInt(record.targetAmount),
        resultAmount: parseInt(record.resultAmount)
      };

      const response = await productionOutputService.calculateOEE(requestData);

      if (response.success) {
        // Update the OEE value in the shift data
        const currentShiftData = getCurrentShiftData();
        const updatedShiftData = currentShiftData.map(item =>
          item.key === record.key
            ? { ...item, oee: response.data.oeePercentage.toString() }
            : item
        );
        setCurrentShiftData(updatedShiftData);
      }
    } catch (error) {
      console.error('Lỗi khi tính toán OEE:', error);
      // You might want to show an error notification to the user
    }
  };


  // Create or update form based on API data - FIXED VERSION
  useEffect(() => {
    if (!selectedLine || !selectedFormType || !selectedDate || !currentLoadedDate) {
      return;
    }

    const formattedDate = dayjs(selectedDate).format('YYYY-MM-DD');

    // Only process if the loaded data is for the current selected date
    if (currentLoadedDate !== formattedDate) {
      console.log('Dữ liệu chưa được tải cho ngày hiện tại, bỏ qua việc tạo biểu mẫu');
      return;
    }

    const existingForm = savedForms.find(form =>
      form.data.line === selectedLine &&
      form.data.date === dayjs(selectedDate).format('DD/MM/YYYY')
    );

    const nextId = existingForm ? existingForm.id : Math.max(...savedForms.map(f => f.id), 0) + 1;
    const stt = existingForm ? existingForm.stt : String(Math.floor(Math.random() * 100000000)).padStart(8, '0');

    // CRITICAL: Bắt đầu với default data sạch (ALWAYS do this)
    let shift1DataForForm = [...defaultShift1Data];
    let shift2DataForForm = [...defaultShift2Data];

    // Function to check if incident overlaps with slot and calculate exact downtime (FIXED VERSION)
    const doesIncidentOverlapSlot = (incident, slotTime, date) => {
      const [slotStartStr, slotEndStr] = slotTime.split(' - ');
      const slotStart = dayjs(`${date} ${slotStartStr}`, 'DD/MM/YYYY HH:mm');
      const slotEnd = dayjs(`${date} ${slotEndStr}`, 'DD/MM/YYYY HH:mm');
      const incidentStart = dayjs(incident.startTime);
      const incidentEnd = dayjs(incident.endTime);

      // Check if incident overlaps with slot
      const overlaps = incidentStart.isBefore(slotEnd) && incidentEnd.isAfter(slotStart);

      if (!overlaps) {
        return { overlaps: false, downtime: 0 };
      }

      // Calculate exact downtime within this slot
      const effectiveStart = incidentStart.isAfter(slotStart) ? incidentStart : slotStart;
      const effectiveEnd = incidentEnd.isBefore(slotEnd) ? incidentEnd : slotEnd;

      const downtimeMinutes = effectiveEnd.diff(effectiveStart, 'minute', true);

      return {
        overlaps: true,
        downtime: Math.max(0, downtimeMinutes) // Ensure non-negative
      };
    };

    // Populate downDetails for each slot in shift1 (FIXED: Calculate exact downtime per slot)
    if (incidents.length > 0) {
      console.log('Populating downDetails for shift1 with', incidents.length, 'incidents');
      shift1DataForForm.forEach(slot => {
        const overlappingIncidents = incidents.filter(incident => {
          const overlapResult = doesIncidentOverlapSlot(incident, slot.time, dayjs(selectedDate).format('DD/MM/YYYY'));
          return overlapResult.overlaps;
        });

        console.log('Slot:', slot.time, 'Overlapping incidents:', overlappingIncidents);

        // Calculate exact downtime for each incident in this slot
        const downDetails = overlappingIncidents.map(incident => {
          const overlapResult = doesIncidentOverlapSlot(incident, slot.time, dayjs(selectedDate).format('DD/MM/YYYY'));
          return {
            type: incident.type?.typeName || 'Unknown',
            minutes: Math.round(overlapResult.downtime * 100) / 100, // Round to 2 decimal places
            issue: incident.issue || '',
            count: null // Set to null or calculate if scrap count is available
          };
        }).filter(detail => detail.minutes > 0); // Only include incidents with actual downtime in this slot

        slot.downDetails = downDetails;
        console.log('Set downDetails for slot:', slot.time, 'to:', slot.downDetails);
      });
    }

    // Populate downDetails for each slot in shift2 (FIXED: Calculate exact downtime per slot)
    if (incidents.length > 0) {
      console.log('Populating downDetails for shift2 with', incidents.length, 'incidents');
      shift2DataForForm.forEach(slot => {
        const overlappingIncidents = incidents.filter(incident => {
          const overlapResult = doesIncidentOverlapSlot(incident, slot.time, dayjs(selectedDate).format('DD/MM/YYYY'));
          return overlapResult.overlaps;
        });

        console.log('Overlapping incidents for slot', slot.time, ':', overlappingIncidents);

        // Calculate exact downtime for each incident in this slot
        const downDetails = overlappingIncidents.map(incident => {
          const overlapResult = doesIncidentOverlapSlot(incident, slot.time, dayjs(selectedDate).format('DD/MM/YYYY'));
          return {
            type: incident.type?.typeName || 'Unknown',
            minutes: Math.round(overlapResult.downtime * 100) / 100, // Round to 2 decimal places
            issue: incident.issue || '',
            count: null // Set to null or calculate if scrap count is available
          };
        }).filter(detail => detail.minutes > 0); // Only include incidents with actual downtime in this slot

        slot.downDetails = downDetails;
      });
    }

    if (productionOutputs.length > 0) {
      console.log('Tiến hành xử lý', productionOutputs.length, 'dữ liệu sản xuất...');

      // Extract dates from API data if available
      const apiItem = productionOutputs[0];
      // Always use selected date as created date to avoid API inconsistencies
      const apiCreatedDate = dayjs(selectedDate).format('DD/MM/YYYY');
      const apiUpdatedDate = apiItem.updatedAt ? dayjs(apiItem.updatedAt).format('DD/MM/YYYY') : apiCreatedDate;

      // Populate shift 1 data from API (PRESERVE downDetails - don't overwrite!)
      const shift1ApiData = productionOutputs.filter(item => item.shiftId === 1);
      console.log('Tiến hành xử lý', shift1ApiData.length, 'dữ liệu ca 1...');

      shift1ApiData.forEach(item => {
        console.log('Tiến hành xử lý ca 1 item:', item);
        console.log('Khung thời gian API:', item.slotTime, 'Loại:', typeof item.slotTime);

        // Use lookup function
        const mapping = slotTimeMappings.lookup(item.slotTime);
        console.log('Kết quả ánh xạ khung thời gian:', mapping);

        if (mapping) {
          // CẬP NHẬT: Tách slot number từ key dạng 'shift-slot'
          const slotNumber = parseInt(mapping.key.split('-')[1]);
          const index = slotNumber - 1; // Index 0-based
          console.log('Cập nhật chỉ mục ca 1:', index);

          if (index >= 0 && index < shift1DataForForm.length) {
            shift1DataForForm[index] = {
              ...shift1DataForForm[index],
              loadingTime: item.loadingTime?.toString() || '',
              targetAmount: item.targetAmount?.toString() || '',
              resultAmount: item.resultAmount?.toString() || '',
              oee: item.oee ? item.oee.toString() : '',
              // ✅ PRESERVE downDetails - don't set it to ''!
            };
            console.log('Cập nhật ca 1 slot', index + 1, ':', shift1DataForForm[index]);
          } else {
            console.warn('Chỉ mục ngoài phạm vi:', index);
          }
        } else {
          console.warn('Không tìm thấy ánh xạ cho khung thời gian:', item.slotTime);
        }
      });

      // Populate shift 2 data from API (PRESERVE downDetails - don't overwrite!)
      const shift2ApiData = productionOutputs.filter(item => item.shiftId === 2);
      console.log('Tiến hành xử lý', shift2ApiData.length, 'dữ liệu ca 2...');

      shift2ApiData.forEach(item => {
        console.log('Tiến hành xử lý ca 2 item:', item);
        console.log('Khung thời gian API:', item.slotTime, 'Loại:', typeof item.slotTime);

        // Use lookup function
        const mapping = slotTimeMappings.lookup(item.slotTime);
        console.log('Kết quả ánh xạ khung thời gian:', mapping);

        if (mapping) {
          // CẬP NHẬT: Tách slot number từ key dạng 'shift-slot'
          const slotNumber = parseInt(mapping.key.split('-')[1]);
          const index = slotNumber - 1; // Index 0-based
          console.log('Cập nhật chỉ mục ca 2:', index);

          if (index >= 0 && index < shift2DataForForm.length) {
            shift2DataForForm[index] = {
              ...shift2DataForForm[index],
              loadingTime: item.loadingTime?.toString() || '',
              targetAmount: item.targetAmount?.toString() || '',
              resultAmount: item.resultAmount?.toString() || '',
              oee: item.oee ? item.oee.toString() : '',
              // ✅ PRESERVE downDetails - don't set it to ''!
            };
            console.log('Cập nhật ca 2 slot', index + 1, ':', shift2DataForForm[index]);
          } else {
            console.warn('Chỉ mục ngoài phạm vi:', index);
          }
        } else {
          console.warn('Không tìm thấy ánh xạ cho khung thời gian:', item.slotTime);
        }
      });

      // Update shift data states
      console.log('Setting shift1Data with', shift1DataForForm);
      console.log('Setting shift2Data with', shift2DataForForm);
      setShift1Data(shift1DataForForm);
      setShift2Data(shift2DataForForm);

      // Calculate cycle times based on the loaded data
      const cycleTimes = calculateCycleTimes(shift1DataForForm, shift2DataForForm);

      const formData = {
        id: nextId,
        stt: stt,
        subtitle: `Bảng quản lý sản lượng - ${selectedLine} [${stt}]`,
        created: existingForm ? existingForm.created : apiCreatedDate,
        updated: apiUpdatedDate,
        status: 'saved',
        data: {
          line: selectedLine,
          process: 'Lắp Sleeve S/A',
          date: dayjs(selectedDate).format('DD/MM/YYYY'),
          actualCycleTime: cycleTimes.actual,
          idealCycleTime: cycleTimes.ideal,
          shifts: {
            1: shift1DataForForm,
            2: shift2DataForForm
          }
        }
      };

      if (existingForm) {
        setSavedForms(prev => prev.map(form =>
          form.id === existingForm.id ? formData : form
        ));
      } else {
        setSavedForms(prev => [...prev, formData]);
      }
    } else {
      // No data from API - create draft form
      console.log('Không có dữ liệu từ API, tạo mẫu nháp...');

      if (!existingForm) {
        const newForm = {
          id: nextId,
          stt: stt,
          subtitle: `Bảng quản lý sản lượng - ${selectedLine} [${stt}]`,
          created: dayjs(selectedDate).format('DD/MM/YYYY'),
          updated: '',
          status: 'draft',
          data: {
            line: selectedLine,
            process: 'Lắp Sleeve S/A',
            date: dayjs(selectedDate).format('DD/MM/YYYY'),
            actualTT: '0.0', // Default for draft
            shifts: {
              1: shift1DataForForm,  // Now includes populated downDetails
              2: shift2DataForForm   // Now includes populated downDetails
            }
          }
        };

        setSavedForms(prev => [...prev, newForm]);
      }

      // Reset to default data (but now with downDetails populated)
      setShift1Data(shift1DataForForm);  // Includes populated downDetails
      setShift2Data(shift2DataForForm);  // Includes populated downDetails
    }
  }, [selectedLine, selectedFormType, selectedDate, productionOutputs, slotTimeMappings, currentLoadedDate, incidents]);  // ✅ 'incidents' is already in dependencies


  const getCurrentShiftData = () => {
    switch (activeShift) {
      case '1': return shift1Data;
      case '2': return shift2Data;
      default: return shift1Data;
    }
  };

  const setCurrentShiftData = (newData) => {
    switch (activeShift) {
      case '1': setShift1Data(newData); break;
      case '2': setShift2Data(newData); break;
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (date && selectedLine && selectedFormType) {
      setCurrentStep(2);
    } else {
      setCurrentStep(1);
    }
  };

  const handleBack = () => {
    setCurrentStep(2);
  };
  //   if (!currentEditingFormId) return;

  //   try {
  //     // Step 1: Reload fresh data
  //     const formattedDate = dayjs(currentFormData.date, 'DD/MM/YYYY').format('YYYY-MM-DD');
  //     const response = await productionOutputService.getByLineAndDate(selectedLine, formattedDate);
  //     const freshProductionOutputs = response?.data || [];

  //     console.log('Đã tải dữ liệu sản lượng sản xuất:', freshProductionOutputs);

  //     const productionOutputsToProcess = [];

  //     // Step 2: Process shift 1 data
  //     shift1Data.forEach(slot => {
  //       if (slot.targetAmount || slot.resultAmount) {
  //         const normalizedSlotTime = normalizeSlotTime(slot.time);
  //         const shiftId = 1;

  //         const existingRecord = freshProductionOutputs.find(po =>
  //           po.lineId === parseInt(selectedLine) &&
  //           dayjs(po.date).format('YYYY-MM-DD') === formattedDate &&
  //           po.shiftId === shiftId &&
  //           normalizeSlotTime(po.slotTime) === normalizedSlotTime
  //         );

  //         if (existingRecord) {
  //           productionOutputsToProcess.push({
  //             id: existingRecord.outputId,  // ✅ USE outputId
  //             loadingTime: slot.loadingTime ? parseInt(slot.loadingTime) : null,
  //             targetAmount: slot.targetAmount ? parseInt(slot.targetAmount) : null,
  //             resultAmount: slot.resultAmount ? parseInt(slot.resultAmount) : null,
  //           });
  //         } else {
  //           productionOutputsToProcess.push({
  //             lineId: parseInt(selectedLine),
  //             date: dayjs(currentFormData.date, 'DD/MM/YYYY').format('YYYY-MM-DD'), // ✅ ĐÚNG
  //             shiftId: shiftId,
  //             slotTime: normalizedSlotTime,
  //             loadingTime: slot.loadingTime ? parseInt(slot.loadingTime) : null,
  //             targetAmount: slot.targetAmount ? parseInt(slot.targetAmount) : null,
  //             resultAmount: slot.resultAmount ? parseInt(slot.resultAmount) : null,
  //           });
  //         }
  //       }
  //     });

  //     // Step 3: Process shift 2 data
  //     shift2Data.forEach(slot => {
  //       if (slot.targetAmount || slot.resultAmount) {
  //         const normalizedSlotTime = normalizeSlotTime(slot.time);
  //         const shiftId = 2;

  //         const existingRecord = freshProductionOutputs.find(po =>
  //           po.lineId === parseInt(selectedLine) &&
  //           dayjs(po.date).format('YYYY-MM-DD') === formattedDate &&
  //           po.shiftId === shiftId &&
  //           normalizeSlotTime(po.slotTime) === normalizedSlotTime
  //         );

  //         if (existingRecord) {
  //           productionOutputsToProcess.push({
  //             id: existingRecord.outputId,  // ✅ USE outputId
  //             loadingTime: slot.loadingTime ? parseInt(slot.loadingTime) : null,
  //             targetAmount: slot.targetAmount ? parseInt(slot.targetAmount) : null,
  //             resultAmount: slot.resultAmount ? parseInt(slot.resultAmount) : null,
  //           });
  //         } else {
  //           productionOutputsToProcess.push({
  //             lineId: parseInt(selectedLine),
  //             date: dayjs(currentFormData.date, 'DD/MM/YYYY').format('YYYY-MM-DD'), // ✅ ĐÚNG
  //             shiftId: shiftId,
  //             slotTime: normalizedSlotTime,
  //             loadingTime: slot.loadingTime ? parseInt(slot.loadingTime) : null,
  //             targetAmount: slot.targetAmount ? parseInt(slot.targetAmount) : null,
  //             resultAmount: slot.resultAmount ? parseInt(slot.resultAmount) : null,
  //           });
  //         }
  //       }
  //     });

  //     // Step 4: Send all create/update requests
  //     const promises = productionOutputsToProcess.map(async (output) => {
  //       if (output.id) {
  //         console.log('Đang gửi yêu cầu CẬP NHẬT cho ID', output.id);
  //         return productionOutputService.update(output.id, {
  //           loadingTime: output.loadingTime,
  //           targetAmount: output.targetAmount,
  //           resultAmount: output.resultAmount
  //         });
  //       } else {
  //         console.log('Đang gửi yêu cầu TẠO mới');
  //         return productionOutputService.create(output);
  //       }
  //     });

  //     await Promise.all(promises);

  //     // ✅ Step 5: RELOAD ALL DATA FROM DATABASE TO GET UPDATED OEE
  //     console.log('⏳ Đang tải lại tất cả dữ liệu sản lượng từ cơ sở dữ liệu...');
  //     const updatedResponse = await productionOutputService.getByLineAndDate(selectedLine, formattedDate);
  //     const updatedProductionOutputs = updatedResponse?.data || [];

  //     // Update the state with fresh data from database
  //     setProductionOutputs(updatedProductionOutputs.map(item => ({
  //       ...item,
  //       id: item.outputId,
  //       slotTime: normalizeSlotTime(item.slotTime)
  //     })));

  //     // ✅ Step 6: Update shift data with latest values from database
  //     const updatedShift1Data = [...defaultShift1Data];
  //     const updatedShift2Data = [...defaultShift2Data];

  //     updatedProductionOutputs.forEach(item => {
  //       if (item.shiftId === 1) {
  //         const mapping = slotTimeMappings.lookup(item.slotTime);
  //         if (mapping) {
  //           const index = parseInt(mapping.key.split('-')[1]) - 1;
  //           if (index >= 0 && index < updatedShift1Data.length) {
  //             updatedShift1Data[index] = {
  //               ...updatedShift1Data[index],
  //               loadingTime: item.loadingTime?.toString() || '',
  //               targetAmount: item.targetAmount?.toString() || '',
  //               resultAmount: item.resultAmount?.toString() || '',
  //               oee: item.oee ? item.oee.toString() : '',  // ✅ GET UPDATED OEE FROM DB
  //             };
  //           }
  //         }
  //       } else if (item.shiftId === 2) {
  //         const mapping = slotTimeMappings.lookup(item.slotTime);
  //         if (mapping) {
  //           const index = parseInt(mapping.key.split('-')[1]) - 1;
  //           if (index >= 0 && index < updatedShift2Data.length) {
  //             updatedShift2Data[index] = {
  //               ...updatedShift2Data[index],
  //               loadingTime: item.loadingTime?.toString() || '',
  //               targetAmount: item.targetAmount?.toString() || '',
  //               resultAmount: item.resultAmount?.toString() || '',
  //               oee: item.oee ? item.oee.toString() : '',  // ✅ GET UPDATED OEE FROM DB
  //             };
  //           }
  //         }
  //       }
  //     });

  //     setShift1Data(updatedShift1Data);
  //     setShift2Data(updatedShift2Data);

  //     // Update saved forms
  //     setSavedForms(prev => prev.map(form =>
  //       form.id === currentEditingFormId
  //         ? {
  //           ...form,
  //           status: 'saved',
  //           updated: dayjs().format('DD/MM/YYYY'),
  //           data: {
  //             line: currentFormData.line,
  //             process: currentFormData.process,
  //             date: currentFormData.date,
  //             actualTT: calculateActualTT(updatedShift1Data, updatedShift2Data),
  //             shifts: {
  //               1: updatedShift1Data,
  //               2: updatedShift2Data
  //             }
  //           }
  //         }
  //         : form
  //     ));

  //     setShowSuccessPage(true);
  //   } catch (error) {
  //     console.error('Lỗi khi lưu vào cơ sở dữ liệu:', error);
  //     if (error.response) {
  //       console.error('API lỗi phản hồi:', error.response.data);
  //     }
  //   }
  // };

  const handleRegisterData = async () => {
    if (!currentEditingFormId) return;

    try {
      // Step 1: Reload fresh data
      const formattedDate = dayjs(currentFormData.date, 'DD/MM/YYYY').format('YYYY-MM-DD');
      const response = await productionOutputService.getByLineAndDate(selectedLine, formattedDate);
      const freshProductionOutputs = response?.data || [];

      console.log('Đã tải dữ liệu sản lượng sản xuất:', freshProductionOutputs);

      const productionOutputsToProcess = [];
      const outputIdsToDelete = []; // ✅ THÊM ARRAY ĐỂ LƯU ID CẦN XÓA
      const errors = []; // Array để lưu lỗi validation

      // Step 2: Process shift 1 data
      shift1Data.forEach(slot => {
        const normalizedSlotTime = normalizeSlotTime(slot.time);
        const shiftId = 1;

        // ✅ VALIDATION: Kiểm tra targetAmount và resultAmount phải >0 và không âm
        const target = parseInt(slot.targetAmount);
        const result = parseInt(slot.resultAmount);
        if (slot.targetAmount && (isNaN(target) || target <= 0)) {
          errors.push(`Slot ${slot.time} (Ca 1): Số lượng mục tiêu phải là số dương (>0).`);
        }
        if (slot.resultAmount && (isNaN(result) || result <= 0)) {
          errors.push(`Slot ${slot.time} (Ca 1): Số lượng thực tế phải là số dương (>0).`);
        }
        // ✅ VALIDATION: Kiểm tra loadingTime không vượt quá max cho slot
        //const maxLoadingTime = slot.time === '11:00 - 12:00' || slot.time === '19:00 - 20:00' ? 30 : 60;
        const maxLoadingTime = 60;
        if (slot.loadingTime && parseInt(slot.loadingTime) > maxLoadingTime) {
          errors.push(`Slot ${slot.time} (Ca 1): Thời gian tải không được vượt quá ${maxLoadingTime} phút.`);
        }
        // ✅ VALIDATION: Kiểm tra loadingTime không giống resultAmount khi target > 0
        // if (slot.loadingTime && slot.resultAmount && slot.targetAmount && parseInt(slot.loadingTime) === parseInt(slot.resultAmount) && parseInt(slot.targetAmount) > 0) {
        //   errors.push(`Slot ${slot.time} (Ca 1): Thời gian tải (${slot.loadingTime} phút) giống với số lượng sản xuất thực tế (${slot.resultAmount}). Vui lòng kiểm tra lại.`);
        // }
        // Nếu có lỗi, bỏ qua slot này
        if (errors.length > 0) return;

        const existingRecord = freshProductionOutputs.find(po =>
          po.lineId === parseInt(selectedLine) &&
          dayjs(po.date).format('YYYY-MM-DD') === formattedDate &&
          po.shiftId === shiftId &&
          normalizeSlotTime(po.slotTime) === normalizedSlotTime
        );

        // ✅ KIỂM TRA NẾU SLOT RỖNG (không có target và result)
        const isEmpty = !slot.targetAmount && !slot.resultAmount;

        if (existingRecord && isEmpty) {
          // ✅ Nếu bản ghi ĐÃ TỒN TẠI và slot RỖNG → XÓA
          outputIdsToDelete.push(existingRecord.outputId);
          console.log(`Đánh dấu để xóa bản ghi ID ${existingRecord.outputId} (slot rỗng)`);
        } else if (!isEmpty) {
          // ✅ Nếu slot CÓ DỮ LIỆU → CREATE hoặc UPDATE
          if (existingRecord) {
            productionOutputsToProcess.push({
              id: existingRecord.outputId,
              loadingTime: slot.loadingTime ? parseInt(slot.loadingTime) : null,
              targetAmount: slot.targetAmount ? parseInt(slot.targetAmount) : null,
              resultAmount: slot.resultAmount ? parseInt(slot.resultAmount) : null,
            });
          } else {
            productionOutputsToProcess.push({
              lineId: parseInt(selectedLine),
              date: dayjs(currentFormData.date, 'DD/MM/YYYY').format('YYYY-MM-DD'),
              shiftId: shiftId,
              slotTime: normalizedSlotTime,
              loadingTime: slot.loadingTime ? parseInt(slot.loadingTime) : null,
              targetAmount: slot.targetAmount ? parseInt(slot.targetAmount) : null,
              resultAmount: slot.resultAmount ? parseInt(slot.resultAmount) : null,
            });
          }
        }
      });

      // Step 3: Process shift 2 data (TƯƠNG TỰ)
      shift2Data.forEach(slot => {
        const normalizedSlotTime = normalizeSlotTime(slot.time);
        const shiftId = 2;

        const target = parseInt(slot.targetAmount);
        const result = parseInt(slot.resultAmount);
        if (slot.targetAmount && (isNaN(target) || target <= 0)) {
          errors.push(`Slot ${slot.time} (Ca 2): Số lượng mục tiêu phải là số dương (>0).`);
        }
        if (slot.resultAmount && (isNaN(result) || result <= 0)) {
          errors.push(`Slot ${slot.time} (Ca 2): Số lượng thực tế phải là số dương (>0).`);
        }
        // ✅ VALIDATION: Kiểm tra loadingTime không vượt quá max cho slot
        const maxLoadingTime = 60;
        if (slot.loadingTime && parseInt(slot.loadingTime) > maxLoadingTime) {
          errors.push(`Slot ${slot.time} (Ca 2): Thời gian tải không được vượt quá ${maxLoadingTime} phút.`);
        }
        // ✅ VALIDATION: Kiểm tra loadingTime không giống resultAmount khi target > 0
        // if (slot.loadingTime && slot.resultAmount && slot.targetAmount && parseInt(slot.loadingTime) === parseInt(slot.resultAmount) && parseInt(slot.targetAmount) > 0) {
        //   errors.push(`Slot ${slot.time} (Ca 2): Thời gian tải (${slot.loadingTime} phút) giống với số lượng sản xuất thực tế (${slot.resultAmount}). Vui lòng kiểm tra lại.`);
        // }
        if (errors.length > 0) return;

        const existingRecord = freshProductionOutputs.find(po =>
          po.lineId === parseInt(selectedLine) &&
          dayjs(po.date).format('YYYY-MM-DD') === formattedDate &&
          po.shiftId === shiftId &&
          normalizeSlotTime(po.slotTime) === normalizedSlotTime
        );

        const isEmpty = !slot.targetAmount && !slot.resultAmount;

        if (existingRecord && isEmpty) {
          outputIdsToDelete.push(existingRecord.outputId);
          console.log(`Đánh dấu để xóa bản ghi ID ${existingRecord.outputId} (slot rỗng)`);
        } else if (!isEmpty) {
          if (existingRecord) {
            productionOutputsToProcess.push({
              id: existingRecord.outputId,
              loadingTime: slot.loadingTime ? parseInt(slot.loadingTime) : null,
              targetAmount: slot.targetAmount ? parseInt(slot.targetAmount) : null,
              resultAmount: slot.resultAmount ? parseInt(slot.resultAmount) : null,
            });
          } else {
            productionOutputsToProcess.push({
              lineId: parseInt(selectedLine),
              date: dayjs(currentFormData.date, 'DD/MM/YYYY').format('YYYY-MM-DD'),
              shiftId: shiftId,
              slotTime: normalizedSlotTime,
              loadingTime: slot.loadingTime ? parseInt(slot.loadingTime) : null,
              targetAmount: slot.targetAmount ? parseInt(slot.targetAmount) : null,
              resultAmount: slot.resultAmount ? parseInt(slot.resultAmount) : null,
            });
          }
        }
      });

      // ✅ KIỂM TRA LỖI SAU VÒNG LẶP VÀ HIỂN THỊ MODAL
      if (errors.length > 0) {
        setValidationErrors(errors);
        setValidationModalVisible(true);
        return; // Dừng function nếu có lỗi
      }

      // ✅ Step 4: XÓA CÁC BẢN GHI RỖNG
      const deletePromises = outputIdsToDelete.map(async (id) => {
        console.log('Đang gửi yêu cầu XÓA cho ID', id);
        return productionOutputService.delete(id);
      });

      // ✅ Step 5: CREATE/UPDATE CÁC BẢN GHI CÓ DỮ LIỆU
      const processPromises = productionOutputsToProcess.map(async (output) => {
        if (output.id) {
          console.log('Đang gửi yêu cầu CẬP NHẬT cho ID', output.id);
          return productionOutputService.update(output.id, {
            loadingTime: output.loadingTime,
            targetAmount: output.targetAmount,
            resultAmount: output.resultAmount
          });
        } else {
          console.log('Đang gửi yêu cầu TẠO mới');
          return productionOutputService.create(output);
        }
      });

      // ✅ Chờ tất cả operations hoàn thành
      await Promise.all([...deletePromises, ...processPromises]);

      // ✅ Step 6: RELOAD ALL DATA FROM DATABASE
      console.log('⏳ Đang tải lại tất cả dữ liệu sản lượng từ cơ sở dữ liệu...');
      const updatedResponse = await productionOutputService.getByLineAndDate(selectedLine, formattedDate);
      const updatedProductionOutputs = updatedResponse?.data || [];

      setProductionOutputs(updatedProductionOutputs.map(item => ({
        ...item,
        id: item.outputId,
        slotTime: normalizeSlotTime(item.slotTime)
      })));

      // ✅ Step 7: Update shift data
      const updatedShift1Data = [...defaultShift1Data];
      const updatedShift2Data = [...defaultShift2Data];

      updatedProductionOutputs.forEach(item => {
        if (item.shiftId === 1) {
          const mapping = slotTimeMappings.lookup(item.slotTime);
          if (mapping) {
            const index = parseInt(mapping.key.split('-')[1]) - 1;
            if (index >= 0 && index < updatedShift1Data.length) {
              updatedShift1Data[index] = {
                ...updatedShift1Data[index],
                loadingTime: item.loadingTime?.toString() || '',
                targetAmount: item.targetAmount?.toString() || '',
                resultAmount: item.resultAmount?.toString() || '',
                oee: item.oee ? item.oee.toString() : '',
              };
            }
          }
        } else if (item.shiftId === 2) {
          const mapping = slotTimeMappings.lookup(item.slotTime);
          if (mapping) {
            const index = parseInt(mapping.key.split('-')[1]) - 1;
            if (index >= 0 && index < updatedShift2Data.length) {
              updatedShift2Data[index] = {
                ...updatedShift2Data[index],
                loadingTime: item.loadingTime?.toString() || '',
                targetAmount: item.targetAmount?.toString() || '',
                resultAmount: item.resultAmount?.toString() || '',
                oee: item.oee ? item.oee.toString() : '',
              };
            }
          }
        }
      });

      setShift1Data(updatedShift1Data);
      setShift2Data(updatedShift2Data);

      // Update saved forms
      setSavedForms(prev => prev.map(form =>
        form.id === currentEditingFormId
          ? {
            ...form,
            status: 'saved',
            updated: dayjs().format('DD/MM/YYYY'),
            data: {
              line: currentFormData.line,
              process: currentFormData.process,
              date: currentFormData.date,
              // actualTT: calculateActualTT(updatedShift1Data, updatedShift2Data),
              actualCycleTime: calculateCycleTimes(updatedShift1Data, updatedShift2Data).actual,
              idealCycleTime: calculateCycleTimes(updatedShift1Data, updatedShift2Data).ideal,
              shifts: {
                1: updatedShift1Data,
                2: updatedShift2Data
              }
            }
          }
          : form
      ));

      setShowSuccessPage(true);
    } catch (error) {
      console.error('Lỗi khi lưu vào cơ sở dữ liệu:', error);
      if (error.response) {
        console.error('API lỗi phản hồi:', error.response.data);
      }
    }
  };

  const handleSaveTemporarily = () => {
    const currentForm = savedForms.find(form => form.id === currentEditingFormId);
    if (currentForm && currentForm.status === 'saved') {
      setConfirmAction('saved-to-temporary');
      setConfirmModalVisible(true);
    } else {
      setConfirmAction('temporary');
      setConfirmModalVisible(true);
    }
  };

  const saveDataLocally = (status) => {
    const currentDate = dayjs().format('DD/MM/YYYY');
    setSavedForms(prev => prev.map(form =>
      form.id === currentEditingFormId
        ? {
          ...form,
          status: status,
          updated: currentDate,
          data: {
            line: currentFormData.line,
            process: currentFormData.process,
            date: currentFormData.date,
            // actualTT: currentFormData.actualTT,
            actualCycleTime: currentFormData.actualCycleTime,
            idealCycleTime: currentFormData.idealCycleTime,
            shifts: {
              1: [...shift1Data],
              2: [...shift2Data]
            }
          }
        }
        : form
    ));
  };

  const handleLoadForm = (form) => {
    setSelectedFormData({
      subtitle: form.subtitle,
      created: form.created,
      updated: form.updated
    });

    setCurrentFormData({
      line: form.data.line,
      process: form.data.process,
      date: form.data.date,
      actualCycleTime: form.data.actualCycleTime,
      idealCycleTime: form.data.idealCycleTime
    });

    setShift1Data(form.data.shifts[1] || [...defaultShift1Data]);
    setShift2Data(form.data.shifts[2] || [...defaultShift2Data]);

    setCurrentEditingFormId(form.id);
    setCurrentStep(3);
  };

  const handleCellClick = (record, dataIndex) => {
    setEditingCell({ record, dataIndex, shift: activeShift });
    setEditValue(record[dataIndex] || (dataIndex === 'downDetails' ? [] : ''));
    setEditModalVisible(true);
  };

  const handleConfirmYes = () => {
    if (confirmAction === 'temporary' || confirmAction === 'saved-to-temporary') {
      if (!currentEditingFormId) return;
      saveDataLocally('temporary');
      setCurrentStep(2);
    }
    setConfirmModalVisible(false);
    setConfirmAction(null);
  };

  const handleConfirmNo = () => {
    setConfirmModalVisible(false);
    setConfirmAction(null);
  };

  const handleSelectProductionForm = () => {
    setShowSuccessPage(false);
    setCurrentStep(2);
  };

  const handleContinue = () => {
    setShowSuccessPage(false);
  };

  const handleModalOk = () => {
    if (!editingCell) return;

    const { record, dataIndex, shift } = editingCell;
    const updatedRecord = { ...record, [dataIndex]: editValue };

    const currentShiftData = getCurrentShiftData();
    const updatedShiftData = currentShiftData.map(item =>
      item.key === record.key ? updatedRecord : item
    );

    setCurrentShiftData(updatedShiftData);

    setEditModalVisible(false);
    setEditingCell(null);
    setEditValue('');
  };

  const getFieldLabel = (dataIndex) => {
    const labels = {
      loadingTime: 'Thời Gian Nạp',
      targetAmount: 'Sản Lượng Mục Tiêu',
      resultAmount: 'Sản Lượng Thực Tế',
      oee: 'OEE',
      downDetails: 'Chi Tiết Thời Gian Dừng Máy'
    };
    return labels[dataIndex] || dataIndex;
  };

  const formatDownDetails = (downDetails) => {
    if (!Array.isArray(downDetails) || downDetails.length === 0) {
      return '';
    }
    return downDetails.map(detail => detail.type).join('\n');
  };

  const columns = [
    {
      title: 'Thời Gian',
      dataIndex: 'time',
      key: 'time',
      width: 150,
      align: 'center',
      fixed: 'left',
      render: (text) => {
        const timeParts = text.split(' - ');
        return (
          <div style={{
            fontWeight: 500,
            lineHeight: '1.4',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '101px',
            height: '101px'
          }}>
            <div style={{
              fontSize: '13px',
              color: '#000000',
              fontWeight: 600,
              paddingBottom: '18px',
              borderBottom: '2px solid #d9d9d9',
              width: '100%',
              textAlign: 'center'
            }}>
              {timeParts[0]}
            </div>
            <div style={{
              fontSize: '13px',
              color: '#000000',
              marginTop: '18px',
              textAlign: 'center'
            }}>
              {timeParts[1]}
            </div>
          </div>
        );
      }
    },
    {
      title: 'Thời Lượng (phút)',
      dataIndex: 'loadingTime',
      key: 'loadingTime',
      width: 180,
      align: 'center',
      render: (text, record) => (
        <div
          style={{
            cursor: 'pointer',
            padding: '12px 8px',
            minHeight: '101px',
            height: '101px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s',
            fontWeight: text ? 500 : 'normal',
            color: '#000000'
          }}
          onClick={() => handleCellClick(record, 'loadingTime')}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          {text}
        </div>
      ),
    },
    {
      title: 'Running Time (phút)',
      dataIndex: 'runningTime',
      key: 'runningTime',
      width: 180,
      align: 'center',
      render: (text, record) => {
        // Tính running time = loadingTime - tổng downtime từ downDetails
        const loadingTime = parseFloat(record.loadingTime) || 0;
        const totalDowntime = Array.isArray(record.downDetails)
          ? record.downDetails.reduce((sum, detail) => sum + (parseFloat(detail.minutes) || 0), 0)
          : 0;
        const runningTime = Math.max(0, loadingTime - totalDowntime);

        return (
          <div
            style={{
              padding: '12px 8px',
              minHeight: '101px',
              height: '101px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s',
              fontWeight: 600,
              color: runningTime < loadingTime ? '#ff4d4f' : '#000000',
              backgroundColor: runningTime < loadingTime ? '#fff2f0' : 'transparent',
              borderRadius: '4px'
            }}
          >
            <div style={{ fontSize: '16px', marginBottom: '4px' }}>
              {runningTime.toFixed(2)}
            </div>
            {/* {runningTime < loadingTime && (
              <div style={{ fontSize: '12px', color: '#ff4d4f', fontWeight: 500 }}>
                -{totalDowntime.toFixed(1)} downtime
              </div>
            )} */}
          </div>
        );
      },
    },
    {
      title: 'Sản Lượng Mục Tiêu',
      dataIndex: 'targetAmount',
      key: 'targetAmount',
      width: 180,
      align: 'center',
      render: (text, record) => (
        <div
          style={{
            cursor: 'pointer',
            padding: '12px 8px',
            minHeight: '101px',
            height: '101px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s',
            fontWeight: text ? 500 : 'normal',
            color: '#000000'
          }}
          onClick={() => handleCellClick(record, 'targetAmount')}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          {text}
        </div>
      ),
    },
    {
      title: 'Sản Lượng Thực Tế',
      dataIndex: 'resultAmount',
      key: 'resultAmount',
      width: 180,
      align: 'center',
      render: (text, record) => (
        <div
          style={{
            cursor: 'pointer',
            padding: '12px 8px',
            minHeight: '101px',
            height: '101px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s',
            fontWeight: text ? 500 : 'normal',
            color: '#000000'
          }}
          onClick={() => handleCellClick(record, 'resultAmount')}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          {text}
        </div>
      ),
    },
    {
      title: 'OEE',
      dataIndex: 'oee',
      key: 'oee',
      width: 180,
      align: 'center',
      render: (text, record) => {
        const displayText = text || '0';
        const isLowPerformance = text && parseFloat(text) < 70;
        const isEmpty = !text;

        return (
          <div
            style={{
              cursor: 'pointer',
              padding: '12px 8px',
              minHeight: '101px',
              height: '101px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s',
              fontWeight: displayText ? 600 : 'normal',
              color: (isLowPerformance || isEmpty) ? '#ff4d4f' : '#000000'
            }}
            //onClick={() => handleCellClick(record, 'oee')}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {displayText}%
          </div>
        );
      },
    },
    {
      title: 'Chi Tiết Thời Gian Dừng',
      dataIndex: 'downDetails',
      key: 'downDetails',
      width: 300,
      align: 'center',
      render: (text, record) => (
        <div
          style={{
            cursor: 'pointer',
            minHeight: '101px',
            height: '101px',
            display: 'flex',
            alignItems: 'flex-start',
            whiteSpace: 'pre-wrap',
            textAlign: 'left',
            fontSize: '13px',
            transition: 'all 0.3s',
            color: '#000000'
          }}
          onClick={() => handleCellClick(record, 'downDetails')}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          {formatDownDetails(text)}
        </div>
      ),
    },
  ];

  const renderSearchForm = () => (
    <div style={{ width: '100%', margin: 0, padding: 0 }}>
      <Card
        style={{
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid #e5e7eb',
          margin: 0,
          height: '100vh'
        }}
        bodyStyle={{ padding: 0 }}
      >
        <div style={{
          background: 'linear-gradient(135deg, #283652 0%, #334766 100%)',
          padding: '32px',
          color: 'white',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '120px',
            height: '120px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            transform: 'translate(40px, -40px)'
          }}></div>
          <Title level={3} style={{ color: 'white', margin: 0, fontWeight: 700, fontSize: '28px' }}>
            Nhập Dữ Liệu E-Form
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', marginTop: '8px', display: 'block' }}>
            Chọn biểu mẫu sản xuất để nhập dữ liệu
          </Text>
        </div>

        <div style={{ padding: '40px' }}>
          <Text type="secondary" style={{
            display: 'block',
            marginBottom: '32px',
            fontSize: '15px',
            color: '#6b7280'
          }}>
            Nhập tiêu chí tìm kiếm để tìm biểu mẫu.
          </Text>

          <Form
            form={searchForm}
            layout="vertical"
            initialValues={{
              lineGroup: 'FZ / LGVAP 0143',
              line: selectedLine,
              formType: selectedFormType,
              date: selectedDate
            }}
          >
            <Row gutter={24}>
              <Col span={24}>
                <Form.Item
                  label={<span style={{ fontWeight: 600, color: '#374151', fontSize: '15px' }}>Dây chuyền</span>}
                  name="line"
                >
                  <Select
                    size="large"
                    placeholder="--Select--"
                    style={{ borderRadius: '8px' }}
                    suffixIcon={<span style={{ color: '#6b7280' }}>▼</span>}
                    onChange={(value) => setSelectedLine(value)}
                    value={selectedLine}
                    loading={loadingLines}
                  >
                    {lines.map(line => (
                      <Option key={line.lineId} value={line.lineId}>
                        {line.lineName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  label={<span style={{ fontWeight: 600, color: '#374151', fontSize: '15px' }}>Loại Biểu Mẫu</span>}
                  name="formType"
                >
                  <Select
                    size="large"
                    placeholder="No options"
                    style={{ borderRadius: '8px' }}
                    suffixIcon={<span style={{ color: '#6b7280' }}>▼</span>}
                    onChange={(value) => setSelectedFormType(value)}
                    value={selectedFormType}
                  >
                    <Option value="Production Amount (E-form)">Production Amount (E-form)</Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  label={<span style={{ fontWeight: 600, color: '#374151', fontSize: '15px' }}>Ngày</span>}
                  name="date"
                >
                  <DatePicker
                    size="large"
                    format="DD/MM/YYYY"
                    style={{ width: '100%', borderRadius: '8px' }}
                    onChange={(date) => {
                      setSelectedDate(date);
                      if (date && selectedLine && selectedFormType) {
                        setCurrentStep(2);
                      } else {
                        setCurrentStep(1);
                      }
                    }}
                    value={selectedDate}
                    placeholder="09/09/2025"
                  />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  label={<span style={{ fontWeight: 600, color: '#374151', fontSize: '15px' }}>Tiêu Đề Biểu Mẫu</span>}
                >
                  <Input
                    size="large"
                    value={selectedLine && selectedFormType && selectedDate ? `Bảng quản lý sản lượng - ${selectedLine} [${previewStt}]` : ''}
                    disabled
                    placeholder="Chọn tất cả các trường ở trên để tạo tiêu đề biểu mẫu"
                    style={{
                      borderRadius: '8px',
                      textAlign: 'left'
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>

          {selectedLine && selectedFormType && selectedDate && (
            <div style={{ marginTop: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <Title level={4} style={{ margin: 0, color: '#283652' }}>
                  Danh sách biểu mẫu đã lưu - {selectedLine}
                </Title>
              </div>
              {(() => {
                const filteredForms = savedForms.filter(form =>
                  form.data.line === selectedLine &&
                  form.data.date === dayjs(selectedDate).format('DD/MM/YYYY')
                );

                // If no forms for this date, create a draft entry for display
                if (filteredForms.length === 0) {
                  const draftForm = {
                    id: 'draft',
                    stt: previewStt,
                    subtitle: `Bảng quản lý sản lượng - ${selectedLine} [${previewStt}]`,
                    created: dayjs(selectedDate).format('DD/MM/YYYY'),
                    updated: '',
                    status: 'draft',
                    data: {
                      line: selectedLine,
                      process: 'Lắp Sleeve S/A',
                      date: dayjs(selectedDate).format('DD/MM/YYYY'),
                      // actualTT: '8.4',
                      actualCycleTime: '',
                      idealCycleTime: '',
                      shifts: {
                        1: [...defaultShift1Data],
                        2: [...defaultShift2Data]
                      }
                    }
                  };
                  filteredForms.push(draftForm);
                }

                return (
                  <Table
                    dataSource={filteredForms}
                    columns={[
                      {
                        title: 'Ngày Tạo',
                        dataIndex: 'created',
                        key: 'created',
                        width: 150,
                        align: 'center',
                        render: (text) => (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: 500 }}>{text}</span>
                          </div>
                        )
                      },
                      {
                        title: 'Ngày Cập Nhật',
                        dataIndex: 'updated',
                        key: 'updated',
                        width: 150,
                        align: 'center',
                        render: (text) => (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: 500 }}>{text || '-'}</span>
                          </div>
                        )
                      },
                      {
                        title: 'Tiêu Đề Biểu Mẫu',
                        dataIndex: 'subtitle',
                        key: 'subtitle',
                        width: 300,
                        render: (text) => (
                          <div style={{
                            fontWeight: 600,
                            color: '#1e40af'
                          }}>
                            {text}
                          </div>
                        )
                      },
                      {
                        title: 'Trạng Thái',
                        dataIndex: 'status',
                        key: 'status',
                        width: 120,
                        align: 'center',
                        render: (status) => (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            backgroundColor:
                              status === 'temporary' ? '#fef3c7' :
                                status === 'saved' ? '#d1fae5' :
                                  '#e0f2fe',
                            color:
                              status === 'temporary' ? '#f59e0b' :
                                status === 'saved' ? '#10b981' :
                                  '#0369a1',
                            fontWeight: 500,
                            fontSize: '13px'
                          }}>
                            {status === 'temporary' ? 'Tạm Thời' : status === 'saved' ? 'Đã Lưu' : 'Bản Nháp'}
                          </div>
                        )
                      },
                    ]}
                    pagination={false}
                    size="middle"
                    bordered
                    style={{
                      borderRadius: '8px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                    }}
                    rowClassName={(record, index) =>
                      index % 2 === 0 ? 'eform-table-row-even' : 'eform-table-row-odd'
                    }
                    onRow={(record) => ({
                      onClick: () => handleLoadForm(record),
                      style: { cursor: 'pointer' }
                    })}
                  />
                );
              })()}
            </div>
          )}
        </div>
      </Card>
    </div>
  );

  // Get line name by ID
  const getLineName = (lineId) => {
    const line = lines.find(l => l.lineId === lineId);
    return line ? line.lineName : lineId;
  };

  const renderProductionForm = () => (
    <div style={{ width: '100%', margin: 0, padding: 0 }}>
      <Card
        style={{
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid #e5e7eb',
          margin: 0
        }}
        bodyStyle={{ padding: 0 }}
      >
        <div style={{
          background: 'linear-gradient(135deg, #283652 0%, #334766 100%)',
          padding: '32px',
          color: 'white',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '120px',
            height: '120px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            transform: 'translate(40px, -40px)'
          }}></div>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              borderRadius: '8px',
              height: '44px',
              fontWeight: 500,
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              backgroundColor: 'rgba(255,255,255,0.1)',
              zIndex: 10
            }}
            size="large"
          >
            Quay Lại Tìm Kiếm
          </Button>
          <Title level={3} style={{ color: 'white', margin: 0, fontWeight: 700, fontSize: '28px' }}>
            Nhập Số Lượng Sản Xuất
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', marginTop: '8px', display: 'block' }}>
            Nhập dữ liệu sản xuất cho mỗi khoảng thời gian
          </Text>
        </div>

        <div style={{
          paddingTop: '40px',
          paddingRight: '40px',
          paddingBottom: '120px',
          paddingLeft: '40px'
        }}>
          <Form layout="horizontal" form={productionForm}>
            <Row gutter={32}>
              {/* First row: Tiêu Đề Biểu Mẫu - full width */}
              <Col span={24}>
                <Form.Item
                  label={<span style={{ fontWeight: 600, color: '#374151', fontSize: '15px', textAlign: 'left', display: 'block' }}>Tiêu Đề Biểu Mẫu</span>}
                  colon={false}
                  labelCol={{ span: 2}}
                  wrapperCol={{ span: 22 }}
                >
                  <Input
                    value={selectedFormData?.subtitle || "Bảng quản lý sản lượng[04119824]"}
                    disabled
                    size="large"
                    style={{
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontWeight: 500,
                      marginLeft: '20px'
                    }}
                  />
                </Form.Item>
              </Col>

              {/* Second row: Dây chuyền - full width */}
              <Col span={24}>
                <Form.Item
                  label={<span style={{ fontWeight: 600, color: '#374151', fontSize: '15px', textAlign: 'left', display: 'block', marginRight: '30px' }}>Dây chuyền</span>}
                  colon={false}
                  labelCol={{ span: 2 }}
                  wrapperCol={{ span: 22 }}
                >
                  <Input
                    value={getLineName(currentFormData.line)}
                    disabled
                    size="large"
                    style={{
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontWeight: 500,
                      marginLeft: '20px'
                    }}
                  />
                </Form.Item>
              </Col>

              {/* Third row: Quy trình - full width */}
              <Col span={24}>
                <Form.Item
                  label={<span style={{ fontWeight: 600, color: '#374151', fontSize: '15px', textAlign: 'left', display: 'block', marginRight: '42px' }}>Quy Trình</span>}
                  colon={false}
                  labelCol={{ span: 2 }}
                  wrapperCol={{ span: 22 }}
                >
                  <Input
                    value={currentFormData.process}
                    disabled
                    size="large"
                    style={{
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontWeight: 500,
                      marginLeft: '20px'
                    }}
                  />
                </Form.Item>
              </Col>

              {/* Fourth row: Ngày - full width */}
              <Col span={24}>
                <Form.Item
                  label={<span style={{ fontWeight: 600, color: '#374151', fontSize: '15px', textAlign: 'left', display: 'block', marginRight: '70px' }}>Ngày</span>}
                  colon={false}
                  labelCol={{ span: 2 }}
                  wrapperCol={{ span: 22 }}
                >
                  <Input
                    value={currentFormData.date}
                    disabled
                    size="large"
                    style={{
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontWeight: 500,
                      marginLeft: '20px'
                    }}
                  />
                </Form.Item>
              </Col>

              {/* Fifth row: TT Thực Tế - full width to align */}
              {/* <Col span={17}>
                <Form.Item
                  label={<span style={{ fontWeight: 600, color: '#374151', fontSize: '15px', textAlign: 'left', display: 'block', marginRight: '50px' }}>TT Thực Tế</span>}
                  colon={false}
                  labelCol={{ span: 3 }}
                  wrapperCol={{ span: 14 }}
                >
                  <Input
                    // value={currentFormData.actualTT}
                    suffix={<Text type="secondary" style={{ fontSize: '13px' }}>{currentFormData.actualTT} | Giây</Text>}
                    size="large"
                    style={{ borderRadius: '8px', marginLeft: '10px' }}
                  />
                </Form.Item>
              </Col> */}
              {/* Fifth row: Actual Cycle Time and Ideal Cycle Time side by side */}
              <Col span={12}>
                <Form.Item
                  label={<span style={{ fontWeight: 600, color: '#374151', fontSize: '15px' }}>Actual Cycle Time</span>}
                  colon={false}
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 16 }}
                >
                  <Input
                    // value={currentFormData.actualCycleTime}
                    disabled
                    size="large"
                    style={{
                      borderRadius: '8px',
                      backgroundColor: '#f0f9ff',
                      border: '1px solid #bae6fd',
                      fontWeight: 600,
                      color: '#0369a1',
                      marginLeft: '25px'
                    }}
                    suffix={<Text type="secondary" style={{ fontSize: '13px', fontWeight: 500 }}>{currentFormData.actualCycleTime} | giây</Text>}
                  />
                  <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '4px', marginLeft: '25px', fontStyle: 'italic' }}>
                    Thời gian thực tế để sản xuất 1 sản phẩm (Operating Time / Output)
                  </Text>
                  <Text type="secondary" style={{ marginLeft: '25px', fontSize: '12px', display: 'block', color: '#059669', fontWeight: 500 }}>
                    Mục tiêu: Càng thấp càng tốt (hiệu suất cao)
                  </Text>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label={<span style={{ fontWeight: 600, color: '#374151', fontSize: '15px' }}>Ideal Cycle Time</span>}
                  colon={false}
                  labelCol={{ span: 8 }}
                  wrapperCol={{ span: 16 }}
                >
                  <Input
                    //value={currentFormData.idealCycleTime}
                    disabled
                    size="large"
                    style={{
                      borderRadius: '8px',
                      backgroundColor: '#fef3c7',
                      border: '1px solid #fde68a',
                      fontWeight: 600,
                      color: '#d97706',
                      marginLeft: '22px'
                    }}
                    suffix={<Text type="secondary" style={{ fontSize: '13px', fontWeight: 500 }}>{currentFormData.idealCycleTime} | giây</Text>}
                  />
                  <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '4px', marginLeft: '22px', fontStyle: 'italic' }}>
                    Thời gian lý tưởng không tính downtime (Loading Time / Output)
                  </Text>
                  <Text type="secondary" style={{ marginLeft: '22px', fontSize: '12px', display: 'block', color: '#0369a1', fontWeight: 500 }}>
                    Dùng để so sánh: Ideal - Actual = Thời gian lãng phí/sản phẩm
                  </Text>
                </Form.Item>
              </Col>
            </Row>
          </Form>

          <div style={{ marginTop: '40px' }}>
            <Tabs
              activeKey={activeShift}
              onChange={setActiveShift}
              size="large"
              className="eform-shift-tabs"
              tabBarStyle={{
                marginBottom: '24px',
                borderBottom: '2px solid #e5e7eb'
              }}
              items={[
                {
                  key: '1',
                  label: (
                    <span style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: activeShift === '1' ? '#283652' : '#6b7280',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      Ca 1 (07:00 - 15:00)
                    </span>
                  ),
                },
                {
                  key: '2',
                  label: (
                    <span style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: activeShift === '2' ? '#283652' : '#6b7280',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      Ca 2 (15:00 - 23:00)
                    </span>
                  ),
                }
              ]}
            />

            <Table
              columns={columns}
              dataSource={getCurrentShiftData()}
              pagination={false}
              bordered
              size="middle"
              scroll={{ x: 1400 }}
              style={{
                marginTop: '16px',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}
              rowClassName={(record, index) =>
                index % 2 === 0 ? 'eform-table-row-even' : 'eform-table-row-odd'
              }
            />
          </div>

          <div style={{
            position: 'fixed',
            bottom: 0,
            right: 0,
            width: 'auto',
            padding: '20px 40px',
            display: 'flex',
            gap: '16px',
            backgroundColor: 'white',
            justifyContent: 'flex-end',
            zIndex: 1000
          }}>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              size="large"
              style={{
                background: 'linear-gradient(135deg, #283652 0%, #334766 100%)',
                border: 'none',
                borderRadius: '8px',
                height: '52px',
                flex: 1,
                maxWidth: '300px',
                fontSize: '16px',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(0, 14, 10, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px #283652';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px #334766';
              }}
              onClick={handleRegisterData}
              title="Lưu vào cơ sở dữ liệu vĩnh viễn"
            >
              Đăng Ký Dữ Liệu
            </Button>
            <Button
              size="large"
              style={{
                borderRadius: '8px',
                height: '52px',
                flex: 1,
                maxWidth: '300px',
                fontSize: '16px',
                fontWeight: 500,
                border: '2px solid #d1d5db',
                color: '#374151'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px #d3d3d3ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              onClick={handleSaveTemporarily}
              title="Chỉ lưu cục bộ (tạm thời)"
            >
              Lưu Tạm Thời
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderSuccessPage = () => (
    <div style={{ width: '100%', margin: 0, padding: 0 }}>
      <Card
        style={{
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid #e5e7eb',
          margin: 0
        }}
        bodyStyle={{ padding: 0 }}
      >
        <div style={{
          background: 'linear-gradient(135deg, #283652 0%, #334766 100%)',
          padding: '32px',
          color: 'white',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '120px',
            height: '120px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            transform: 'translate(40px, -40px)'
          }}></div>
          <Title level={3} style={{ color: 'white', margin: 0, fontWeight: 700, fontSize: '28px' }}>
            Đăng Ký Hoàn Thành
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', marginTop: '8px', display: 'block' }}>
            Dữ liệu sản xuất của bạn đã được đăng ký thành công
          </Text>
        </div>

        <div style={{ padding: '80px 40px', textAlign: 'center' }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '24px',
            color: '#10b981'
          }}>
            ✓
          </div>
          <Title level={2} style={{
            color: '#059669',
            marginBottom: '40px',
            fontWeight: 600
          }}>
            Đăng ký hoàn thành thành công
          </Title>

          <div style={{
            display: 'flex',
            gap: '24px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <Button
              type="primary"
              size="large"
              onClick={handleSelectProductionForm}
              style={{
                background: 'linear-gradient(135deg, #283652 0%, #334766 100%)',
                border: 'none',
                borderRadius: '8px',
                height: '52px',
                padding: '0 32px',
                fontSize: '16px',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
              }}
            >
              Chọn Biểu Mẫu Sản Xuất
            </Button>
            <Button
              size="large"
              onClick={handleContinue}
              style={{
                borderRadius: '8px',
                height: '52px',
                padding: '0 32px',
                fontSize: '16px',
                fontWeight: 500,
                border: '2px solid #d1d5db',
                color: '#374151'
              }}
            >
              Tiếp Tục
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="eform-system-root" style={{
      padding: 0,
      margin: 0,
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      minHeight: '100vh',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      {showSuccessPage ? renderSuccessPage() : currentStep < 3 ? renderSearchForm() : renderProductionForm()}

      {/* Modal Validation */}
      <Modal
        title="Cảnh Báo Xác Nhận Dữ Liệu"
        visible={validationModalVisible}
        onCancel={() => setValidationModalVisible(false)}
        footer={[
          <Button key="ok" type="primary" onClick={() => setValidationModalVisible(false)}>
            OK
          </Button>,
        ]}
      >
        <div>
          <p>Các cảnh báo sau cần được kiểm tra:</p>
          <ul>
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      </Modal>

      <Modal
        title={
          <div style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#1f2937',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {editingCell?.dataIndex === 'downDetails' ? 'Xem Chi Tiết' : `Chỉnh Sửa ${getFieldLabel(editingCell?.dataIndex)}`}
          </div>
        }
        open={editModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingCell(null);
          setEditValue('');
        }}
        okText={editingCell?.dataIndex === 'downDetails' ? "Đóng" : "Lưu"}
        width={500}
        okButtonProps={{
          size: 'large',
          style: {
            background: 'linear-gradient(135deg, #283652 0%, #334766 100%)',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 500
          }
        }}
        cancelButtonProps={{
          size: 'large',
          style: { borderRadius: '6px' }
        }}
      >
        <Form layout="vertical" style={{ marginTop: '16px' }}>
          <Form.Item
            label={<span style={{ fontWeight: 500, color: '#374151' }}>{getFieldLabel(editingCell?.dataIndex)}</span>}
          >
            {editingCell?.dataIndex === 'downDetails' ? (
              <div style={{
                padding: '12px',
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                minHeight: '200px',
                maxHeight: '400px',
                overflowY: 'auto'
              }}>
                {Array.isArray(editValue) && editValue.length > 0 ? (
                  <div>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#1f2937',
                      marginBottom: '16px',
                      textAlign: 'center'
                    }}>
                      Chi Tiết Thời Gian Dừng Máy - {editingCell?.record?.time}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {editValue.map((detail, index) => (
                        <div key={index} style={{
                          padding: '12px',
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#374151',
                            marginBottom: '8px'
                          }}>
                            {detail.type}
                          </div>
                          <div style={{
                            display: 'flex',
                            gap: '16px',
                            fontSize: '13px',
                            color: '#6b7280',
                            flexDirection: 'column'  // ✅ THAY ĐỔI: Dùng column để dễ thêm issue
                          }}>
                            <span>Thời gian: {detail.minutes.toFixed(2)} phút</span>
                            {detail.issue && (  // ✅ THÊM: Chỉ hiển thị nếu có issue
                              <span>Vấn đề: {detail.issue}</span>
                            )}
                            {detail.type === 'Phế phẩm' && detail.count && (
                              <span>Số lượng: {detail.count}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{
                      marginTop: '16px',
                      padding: '12px',
                      backgroundColor: '#e0f2fe',
                      border: '1px solid #bae6fd',
                      borderRadius: '6px',
                      fontSize: '13px',
                      color: '#0369a1',
                      fontStyle: 'italic'
                    }}>
                      <strong>Lưu ý:</strong> Hệ thống tự động phân chia thời gian dừng máy cho các slot bị ảnh hưởng bởi sự cố lan ra nhiều slot. Thời gian hiển thị ở đây là phần thời gian dừng thực tế trong slot này.
                    </div>
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    color: '#6b7280',
                    fontSize: '14px',
                    padding: '40px 0'
                  }}>
                    Không có chi tiết thời gian dừng máy được ghi lại
                  </div>
                )}
              </div>
            ) : (
              <Input
                size="large"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder={`Nhập ${getFieldLabel(editingCell?.dataIndex)} (giá trị số)`}
                autoFocus
                style={{ borderRadius: '6px' }}
              />
            )}
          </Form.Item>
        </Form>
      </Modal>

      {/* Confirmation Modal for Save Temporarily */}
      <Modal
        title={confirmAction === 'saved-to-temporary' ? "Xác Nhận Chỉ Lưu Cục Bộ" : "Xác Nhận Lưu Tạm Thời"}
        visible={confirmModalVisible}
        onCancel={handleConfirmNo}
        footer={[
          <Button key="no" onClick={handleConfirmNo}>
            Không
          </Button>,
          <Button key="yes" type="primary" onClick={handleConfirmYes}>
            Có
          </Button>,
        ]}
      >
        <p>
          {confirmAction === 'saved-to-temporary'
            ? "Biểu mẫu này đã được đăng ký. Lưu tạm thời sẽ thay đổi trạng thái trở lại tạm thời và chỉ lưu cục bộ (không cập nhật cơ sở dữ liệu). Bạn có muốn tiếp tục không?"
            : "Lưu tạm thời sẽ lưu dữ liệu cục bộ chỉ (không chèn cơ sở dữ liệu). Bạn vẫn muốn quay lại màn hình kết quả số lượng sản xuất không?"
          }
        </p>
      </Modal>
    </div>
  );
};

export default EFormSystem;