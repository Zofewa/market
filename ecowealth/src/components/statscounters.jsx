import React from "react";

export default function StatsCounters({ stats }) {
    return (
        <div className="stats-counters">
            {stats.map((stat, idx) => (
                <div className="stat-card" key={idx}>
                    <div className="stat-value">{stat.value.toLocaleString()}</div>
                    <div className="stat-label">{stat.label}</div>
                </div>
            ))}
        </div>
    );
}