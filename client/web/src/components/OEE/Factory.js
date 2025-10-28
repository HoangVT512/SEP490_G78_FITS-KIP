import React from 'react'
import { FactoryBox } from './FactoryBox'
import { mechanicalData, assemblyData, wireData } from '../data/factoryData'

export function Factory({ title, type, onBoxHover, onBoxLeave, onIncidentClick }) {
  const data = type === 'mechanical' ? mechanicalData : type === 'assembly' ? assemblyData : wireData

  // Add sample incident data to some boxes for demo
  const dataWithIncidents = data.map(area => ({
    ...area,
    boxes: area.boxes.map(box => {
      // Add incidents to some boxes for demo purposes
      if (box.code === 'CK-C04' && type === 'mechanical') {
        return { ...box, incident: { hours: 2.5, description: 'Máy CNC bị lỗi' } }
      }
      if (box.code === 'LR-L02' && type === 'assembly') {
        return { ...box, incident: { hours: 1.8, description: 'Thiếu linh kiện' } }
      }
      if (box.code === 'DY-D04' && type === 'wire') {
        return { ...box, incident: { hours: 3.2, description: 'Dây dẫn đứt' } }
      }
      return box
    })
  }))

  const gridClass = `oee-factory-grid ${type}-grid`
  return (
    <div className="oee-factory">
      <h2>{title}</h2>
      <div className={gridClass}>
        {dataWithIncidents.map((area, index) => (
          <div key={index} className={area.className}>
            {area.isEmpty ? (
              <div style={{ color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5em' }}>
                Empty area
              </div>
            ) : (
              area.boxes.map((box, boxIndex) => (
                <FactoryBox
                  key={boxIndex}
                  data={box}
                  onHover={onBoxHover}
                  onLeave={onBoxLeave}
                  onIncidentClick={onIncidentClick}
                />
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  )
}