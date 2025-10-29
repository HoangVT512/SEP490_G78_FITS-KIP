import React, { useEffect, useState } from 'react'
import { LoadingOverlay } from '../../components/OEE/LoadingOverlay'
import { Header } from '../../components/OEE/Header'
import { Legend } from '../../components/OEE/Legend'
import { Factory } from '../../components/OEE/Factory'
import { IncidentModal } from '../../components/OEE/IncidentModal'
import { Tooltip } from '../../components/OEE/Tooltip'
import { Footer } from '../../components/OEE/Footer'
import { dashboardService } from '../../services/dashboardService'
import { incidentService } from '../../services/incidentService'
import '../../styles/pages/OEE.css'

const OEEDashboard = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [tooltipData, setTooltipData] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [modalData, setModalData] = useState(null)
  const [oeeData, setOeeData] = useState([])
  const [incidentData, setIncidentData] = useState([])

  // Fetch OEE and incident data
  const fetchData = async (date) => {
    setIsLoading(true)
    try {
      console.log('Fetching data for date:', date);
      
      // Fetch OEE data for all lines
      const oeeResponse = await dashboardService.getOEEStatsByDate(date)
      console.log('OEE Response:', oeeResponse);
      if (oeeResponse?.success && oeeResponse?.data) {
        setOeeData(oeeResponse.data)
      }

      // Fetch pending tech support incidents
      // Format date for incident API (yyyy-MM-dd)
      console.log('Calling incident API with date:', date);
      try {
        const incidentResponse = await incidentService.getTechSupportPendingIncidents(date)
        console.log('Incident API call completed');
        console.log('Incident Response:', incidentResponse);
        if (incidentResponse?.success && incidentResponse?.data) {
          console.log('Setting incident data:', incidentResponse.data);
          setIncidentData(incidentResponse.data)
        } else {
          console.log('No incident data or invalid response');
          setIncidentData([]);
        }
      } catch (incidentError) {
        console.error('Error fetching incident data:', incidentError);
        setIncidentData([]);
      }
    } catch (error) {
      console.error('Error fetching OEE dashboard data:', error)
      setIncidentData([]);
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData(selectedDate)
    
    // Set up polling for real-time updates every 60 seconds (1 minute)
    const interval = setInterval(() => {
      fetchData(selectedDate)
    }, 60000)

    return () => clearInterval(interval)
  }, [selectedDate])

  // Debug: log incident data changes
  useEffect(() => {
    console.log('Incident data state changed:', incidentData);
  }, [incidentData]);

  const handleDateChange = (date) => {
    setSelectedDate(date)
  }

  const handleBoxHover = (data, event) => {
    const rect = event.target.getBoundingClientRect()
    setTooltipData(data)
    setTooltipPosition({ x: rect.right + 10, y: rect.top })
  }

  const handleBoxLeave = () => {
    setTooltipData(null)
  }

  const handleIncidentClick = (data) => {
    // Format modal data from incident
    const formattedData = {
      equipmentCode: data.incident?.incidents[0]?.equipmentCode || '-',
      equipmentName: data.incident?.incidents[0]?.equipmentName || '-',
      stage: data.incident?.incidents[0]?.stage || '-',
      line: data.incident?.incidents[0]?.line || data.name || '-',
      startTime: data.incident?.incidents[0]?.startTime 
        ? new Date(data.incident.incidents[0].startTime).toLocaleString('vi-VN')
        : '-',
      hours: data.incident?.hours || '-',
      assignee: data.incident?.incidents[0]?.assignedTo || '-',
      oee: data.oee || '-',
      issue: data.incident?.incidents[0]?.issue || '-', // Add issue field
      incidentCount: data.incident?.count || 0,
      allIncidents: data.incident?.incidents || []
    }
    setModalData(formattedData)
  }

  return (
    <div className="oee-reset">
      <LoadingOverlay isLoading={isLoading} />
      <div className="main-container" style={{ opacity: isLoading ? 0 : 1 }}>
        <Header selectedDate={selectedDate} onDateChange={handleDateChange} />
        <Legend />
        <div className="factories-container">
          <Factory
            title="Xưởng Cơ khí"
            type="mechanical"
            oeeData={oeeData}
            incidentData={incidentData}
            onBoxHover={handleBoxHover}
            onBoxLeave={handleBoxLeave}
            onIncidentClick={handleIncidentClick}
          />
          <Factory
            title="Xưởng Lắp ráp"
            type="assembly"
            oeeData={oeeData}
            incidentData={incidentData}
            onBoxHover={handleBoxHover}
            onBoxLeave={handleBoxLeave}
            onIncidentClick={handleIncidentClick}
          />
          <Factory
            title="Xưởng Dây"
            type="wire"
            oeeData={oeeData}
            incidentData={incidentData}
            onBoxHover={handleBoxHover}
            onBoxLeave={handleBoxLeave}
            onIncidentClick={handleIncidentClick}
          />
        </div>
        <Tooltip data={tooltipData} position={tooltipPosition} />
        <IncidentModal data={modalData} onClose={() => setModalData(null)} />
        <Footer />
      </div>
    </div>
  )
}

export default OEEDashboard