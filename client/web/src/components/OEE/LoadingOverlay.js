import React from 'react'
export function LoadingOverlay({ isLoading }) {
    if (!isLoading) return null
    return (
        <div className="loading-overlay">
            <svg className="loading-icon" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="buildingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#666', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#999', stopOpacity: 1 }} />
                    </linearGradient>
                    <linearGradient id="roofGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#999', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#ccc', stopOpacity: 1 }} />
                    </linearGradient>
                </defs>
                <rect x="40" y="100" width="120" height="80" fill="url(#buildingGrad)" stroke="#333" strokeWidth="2" />
                <polygon points="30,100 100,40 170,100" fill="url(#roofGrad)" stroke="#333" strokeWidth="2" />
                <rect x="70" y="30" width="15" height="70" fill="#333" stroke="#000" strokeWidth="1" />
                <rect x="115" y="35" width="12" height="65" fill="#333" stroke="#000" strokeWidth="1" />
                <ellipse cx="77.5" cy="25" rx="8" ry="5" fill="#e0e0e0" opacity="0.8" />
                <ellipse cx="122" cy="30" rx="6" ry="4" fill="#e0e0e0" opacity="0.6" />
                <ellipse cx="75" cy="20" rx="5" ry="3" fill="#f0f0f0" opacity="0.7" />
                <ellipse cx="120" cy="25" rx="4" ry="3" fill="#f0f0f0" opacity="0.5" />
                <rect x="50" y="110" width="15" height="15" fill="#87CEEB" stroke="#000" strokeWidth="1" />
                <rect x="75" y="110" width="15" height="15" fill="#87CEEB" stroke="#000" strokeWidth="1" />
                <rect x="100" y="110" width="15" height="15" fill="#87CEEB" stroke="#000" strokeWidth="1" />
                <rect x="125" y="110" width="15" height="15" fill="#87CEEB" stroke="#000" strokeWidth="1" />
                <rect x="50" y="135" width="15" height="15" fill="#87CEEB" stroke="#000" strokeWidth="1" />
                <rect x="75" y="135" width="15" height="15" fill="#87CEEB" stroke="#000" strokeWidth="1" />
                <rect x="100" y="135" width="15" height="15" fill="#87CEEB" stroke="#000" strokeWidth="1" />
                <rect x="125" y="135" width="15" height="15" fill="#87CEEB" stroke="#000" strokeWidth="1" />
                <rect x="85" y="155" width="30" height="25" fill="#8B4513" stroke="#000" strokeWidth="1" />
                <rect x="35" y="165" width="130" height="5" fill="#555" stroke="#000" strokeWidth="1" />
                <rect x="40" y="170" width="120" height="3" fill="#777" stroke="#000" strokeWidth="1" />
                <rect x="60" y="80" width="4" height="20" fill="#666" stroke="#000" strokeWidth="1" />
                <rect x="140" y="85" width="4" height="15" fill="#666" stroke="#000" strokeWidth="1" />
            </svg>
        </div>
    )
}