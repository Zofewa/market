import React, { useEffect } from "react";
import { useState } from "react";
import axios from "axios";

export default function ReadersBoard() {
  const [leads, setLeads] = useState([]);

  const fetchLeads = async() => {
    try {
      const res = await axios.get("http://localhost:5001/api/score", {withCredentials: true});
      setLeads(res.data.slice(0, 3));
    } catch (error) {
      
    }
  }

  useEffect(() => {
    fetchLeads();
  }, [])

  console.log(leads)

  return (
    <div className="readers-board-card">
      <h4 className="readers-board-title">LeaderBoard</h4>
      <div className="readers-board-list">
        {(leads || []).map((lead, idx) => (
          <div className={`readers-board-item num${idx + 1}`} key={lead.id}>
            <span className= "readers-board-rank">{idx + 1}</span>
            <img
              className="readers-board-avatar"
              src={lead.photo_url ? `http://localhost:5001${lead.photo_url}` : 
              "http://localhost:5001/uploads/default-user-pic.png"}
              alt={lead.user_name}
            />
            <span className="readers-board-name">{lead.user_name}</span>
            <span className="readers-board-points">{lead.points} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}