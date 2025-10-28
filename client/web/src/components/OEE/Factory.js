import React from 'react'
import { FactoryBox } from './FactoryBox'
import { mechanicalData, assemblyData, wireData } from '../data/factoryData'
export function Factory({ title, type, onBoxHover, onBoxLeave, onIncidentClick }) {
  const data = type === 'mechanical' ? mechanicalData : type === 'assembly' ? assemblyData : wireData
  const gridClass = `oee-factory-grid ${type}-grid`
  return (
    <div className="oee-factory">
      <h2>{title}</h2>
      <div className={gridClass}>
        {data.map((area, index) => (
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