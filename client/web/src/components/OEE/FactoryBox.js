import React from 'react'
export function FactoryBox({ data, onHover, onLeave, onIncidentClick }) {
  return (
    <div
      className={`box ${data.colorClass}`}
      onMouseEnter={(e) => onHover(data, e)}
      onMouseLeave={onLeave}
    >
      <div className="line-code">{data.code}</div>
      <div className="percentage">{data.oee}%</div>
      {data.incident && (
        <div
          className="incident-icon"
          onClick={(e) => {
            e.stopPropagation()
            onIncidentClick({ ...data, ...data.incident })
          }}
        >
          <div className="droplet">
            <span className="incident-hours">{data.incident.hours}</span>
          </div>
        </div>
      )}
    </div>
  )
}