import React from 'react'
import { FactoryBox } from './FactoryBox'
import { mechanicalData, assemblyData, wireData, LINE_CONFIG, getOEEColor } from '../data/factoryData'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

export function Factory({ title, type, oeeData, incidentData, onBoxHover, onBoxLeave, onIncidentClick }) {
  const layoutData = type === 'mechanical' ? mechanicalData : type === 'assembly' ? assemblyData : wireData

  // Debug: log incident data
  console.log(`[${type}] Incident Data:`, incidentData);

  // Helper function to calculate incident hours
  const calculateIncidentHours = (lineIncident) => {
    if (lineIncident.totalDuration > 0) {
      // Use API provided duration if available
      return (lineIncident.totalDuration / 60).toFixed(1);
    } else if (lineIncident.incidents && lineIncident.incidents.length > 0) {
      // Calculate from start time to now in Vietnam timezone
      const firstIncident = lineIncident.incidents[0];
      if (firstIncident.startTime) {
        const startTime = dayjs(firstIncident.startTime);
        const now = dayjs().tz('Asia/Ho_Chi_Minh');
        const diffMinutes = now.diff(startTime, 'minute');
        return (diffMinutes / 60).toFixed(1);
      }
    }
    return '?';
  };

  // Build boxes from layout and API data
  const buildBoxes = (area) => {
    if (area.isEmpty) return null;
    
    // If area has lineIds, build boxes from API data
    if (area.lineIds) {
      const boxes = area.lineIds.map(lineId => {
        const lineConfig = LINE_CONFIG[lineId];
        if (!lineConfig) return null;

        const lineOEE = oeeData?.find(d => d.lineId === lineId);
        const lineIncident = incidentData?.find(d => d.lineId === lineId);
        
        // Debug: log for line 2
        if (lineId === 2) {
          console.log(`Line 2 - OEE:`, lineOEE);
          console.log(`Line 2 - Incident:`, lineIncident);
        }
        
        // Calculate A, P, Q from dailyStats if available
        const dailyStat = lineOEE?.dailyStats?.[0];
        const oee = dailyStat?.oee || 0;
        const availability = dailyStat ? (100 - (dailyStat.aLoss || 0)) : 0;
        const performance = dailyStat ? (100 - (dailyStat.pLoss || 0)) : 0;
        const quality = dailyStat ? (100 - (dailyStat.qLoss || 0)) : 0;

        return {
          code: lineConfig.code,
          name: lineConfig.name,
          lineId: lineId,
          oee: oee.toFixed(1),
          availability: availability.toFixed(1),
          performance: performance.toFixed(1),
          quality: quality.toFixed(1),
          status: oee > 0 ? 'Running' : 'No Data',
          colorClass: getColorClass(oee),
          incident: lineIncident ? {
            hours: calculateIncidentHours(lineIncident),
            count: lineIncident.incidentCount,
            incidents: lineIncident.incidents
          } : null
        };
      }).filter(Boolean);

      // Add office box if needed
      if (area.hasOffice) {
        boxes.push({
          code: 'OFF1',
          oee: '-',
          availability: '-',
          performance: '-',
          quality: '-',
          status: 'Office',
          colorClass: 'box-white'
        });
      }

      return boxes;
    }

    // Return static boxes if defined
    return area.boxes || [];
  };

  const getColorClass = (oee) => {
    const color = getOEEColor(oee);
    if (color === '#4CAF50') return 'box-green';
    if (color === '#FFEB3B') return 'box-yellow';
    if (color === '#F44336') return 'box-red';
    return 'box-white';
  };

  return (
    <div className="oee-factory">
      <h2>{title}</h2>
      <div className={`oee-factory-grid ${type}-grid`}>
        {layoutData.map((area, index) => {
          const boxes = buildBoxes(area);
          
          return (
            <div key={index} className={area.className}>
              {area.isEmpty ? (
                <div style={{ color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5em' }}>
                  Empty area
                </div>
              ) : (
                boxes?.map((box, boxIndex) => (
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
          );
        })}
      </div>
    </div>
  )
}