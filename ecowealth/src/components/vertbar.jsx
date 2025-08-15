import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

const VerticalBar = () => {
    const navigate = useNavigate();
    const [confirmBox, showConfirmBox] = useState(false);

    const toggleConfirm = () => showConfirmBox(!confirmBox);

    const handleLogout = async () => {
        try {
            await axios.post("http://localhost:5001/logout", {}, { withCredentials: true });
            navigate("/");
        } catch {
            alert("Logout failed. Please try again.");
        }
    };

    return (
        <>
            {confirmBox && (
                <div className="confirm">
                    <div className="content">
                        <p>You are going to be logged out</p>
                        <button onClick={handleLogout} className="confirm-btn">Continue</button>
                        <button onClick={toggleConfirm} className="cancel-btn">Cancel</button>
                    </div>
                </div>
            )}

            <nav className="vertical-nav-modern">
                <div className="nav-section">
                    <div className="nav-link" onClick={() => navigate('/dashboard')}>
                        <span className="nav-icon">📊</span>
                        <span>Dashboard</span>
                    </div>
                    <div className="nav-link" onClick={() => navigate('/marketplace')}>
                        <span className="nav-icon">🛒</span>
                        <span>Marketplace</span>
                    </div>
                    <div className="nav-link" onClick={() => navigate('/newlisting')}>
                        <span className="nav-icon">💰</span>
                        <span>Sell</span>
                    </div>
                    <div className="nav-link" onClick={() => navigate('/mylisting')}>
                        <span className="nav-icon">📦</span>
                        <span>My Listings</span>
                    </div>
                    <div className="nav-link" onClick={() => navigate('/routes')}>
                        <span className="nav-icon">🗺️</span>
                        <span>Routes</span>
                    </div>
                    <div className="nav-link" onClick={() => navigate('/chat')}>
                        <span className="nav-icon">💬</span>
                        <span>Chat</span>
                    </div>
                </div>
                <div className="nav-section nav-bottom">
                    <div className="nav-link" onClick={() => navigate('/myprofile')}>
                        <span className="nav-icon">👤</span>
                        <span>Profile</span>
                    </div>
                    <div className="nav-link logout-link" onClick={toggleConfirm}>
                        <span className="nav-icon">🚪</span>
                        <span>Log out</span>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default VerticalBar;