import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';

function WasteVolume() {
  const [percentages, setPercents] = useState([]);

  const getPercents = async () => {
    try {
        const res = await axios.get("http://localhost:5001/percents", {withCredentials: true });
        setPercents(Array.isArray(res.data) ? res.data : []);
        console.log(res.data)
    } catch (error) {
        console.log(error)
    }
  }
  
  useEffect(() => {
    getPercents();
  }, []);
  
  console.log(percentages)
  // Example data, replace with props or state if dynamic
  const wasteData = [
    { name: "E-Waste", label: "E-Waste", value: "0.6%", color: "#7e57c2", icon: "💻" },
    { name: "Organic", label: "Organic Waste", value: "0.6%", color: "#43a047", icon: "🍃" },
    { name: "Metal", label: "Metal Waste", value: "0.6%", color: "#78909c", icon: "🔩" },
    { name: "Plastic", label: "Plastic Waste", value: "0.6%", color: "#29b6f6", icon: "🧴" },
    { name: "Paper", label: "Paper Waste", value: "0.6%", color: "#fbc02d", icon: "📄" },
    { name: "Glass", label: "Glass Waste", value: "0.6%", color: "#8bc34a", icon: "🥃" },
  ];

  return (
    <div className="waste-volume-modern">
      <h4 className="wv-title">You have helped to remove</h4>
      <div className="wv-list">
        {wasteData.map((w, i) => (
          <div className="wv-card" key={w.label} style={{ borderColor: w.color }}>
            <div className="wv-icon" style={{ background: w.color + "22" }}>{w.icon}</div>
            <div>
              <h3 className="wv-label">{w.label}</h3>
              <div className="wv-value" style={{ color: w.color }}>
                {percentages.map((per) => (
                  <span key={per.name}>
                    {w.name == per.name && (
                      <span>{per.percent.toFixed(2)} %</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WasteVolume;