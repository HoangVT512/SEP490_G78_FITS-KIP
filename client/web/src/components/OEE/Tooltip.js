import React, { useEffect, useState } from 'react'
export function Tooltip({ data, position }) {
    const [adjustedPosition, setAdjustedPosition] = useState(position)
    useEffect(() => {
        if (data) {
            const tooltipWidth = 200
            let leftPos = position.x
            if (position.x + tooltipWidth + 10 > window.innerWidth) {
                leftPos = position.x - tooltipWidth - 20
            }
            setAdjustedPosition({ x: leftPos, y: position.y })
        }
    }, [data, position])
    if (!data) return null
    return (
        <div
            className="oee-tooltip show"
            style={{ left: `${adjustedPosition.x}px`, top: `${adjustedPosition.y}px` }}
        >
            <strong>{data.code}</strong>
            <br />
            OEE: {data.oee}%<br />
            Tính khả dụng: {data.availability}%<br />
            Hiệu suất: {data.performance}%<br />
            Chất lượng: {data.quality}%<br />
        </div>
    )
}