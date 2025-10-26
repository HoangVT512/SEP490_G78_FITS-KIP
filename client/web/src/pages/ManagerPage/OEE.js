import React, { useEffect, useState } from 'react'
import { LoadingOverlay } from '../../components/OEE/LoadingOverlay'
import { Header } from '../../components/OEE/Header'
import { Legend } from '../../components/OEE/Legend'
import { Factory } from '../../components/OEE/Factory'
import { IncidentModal } from '../../components/OEE/IncidentModal'
import { Tooltip } from '../../components/OEE/Tooltip'
import { Footer } from '../../components/OEE/Footer'
import '../../styles/pages/OEE.css'
const OEE = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [tooltipData, setTooltipData] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [modalData, setModalData] = useState(null)
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])
  const handleDateChange = (date) => {
    setSelectedDate(date)
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 2000)
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
    setModalData(data)
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
            onBoxHover={handleBoxHover}
            onBoxLeave={handleBoxLeave}
            onIncidentClick={handleIncidentClick}
          />
          <Factory
            title="Xưởng Lắp ráp"
            type="assembly"
            onBoxHover={handleBoxHover}
            onBoxLeave={handleBoxLeave}
            onIncidentClick={handleIncidentClick}
          />
          <Factory
            title="Xưởng Dây"
            type="wire"
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

export default OEE