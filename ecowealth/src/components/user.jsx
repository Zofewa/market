import { useState, useEffect, useRef } from "react";
import Notifications from "./notifications";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function User() {
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const [user, setUser] = useState({});
    const popupRef = useRef();

    const toggleNotifications = () => setShowNotifications((prev) => !prev);

    // Close popup when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (popupRef.current && !popupRef.current.contains(event.target) && showNotifications) {
                setShowNotifications(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showNotifications]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get("http://localhost:5001/user", { withCredentials: true });
                setUser(response.data);
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };
        fetchUser();
    }, []);

    return (
        <div className="user-profile">
            <div className="user-info">
                <button
                    className="notification-icon"
                    aria-label="Show notifications"
                    onClick={toggleNotifications}
                >
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="gray">
                        <path d="M12 22c1.1 0 2-.9 2-2H10c0 1.1.9 2 2 2zm6-6V9c0-3.07-2.64-5.64-5.7-5.98A5.99 5.99 0 0 0 6 9v7l-2 2v1h16v-1l-2-2z" fill="currentColor"/>
                    </svg>
                    <span className="notification-count">3</span>
                </button>
                <img
                    className="user-avatar"
                    onClick={() => navigate("/myprofile")}
                    src={
                        user.photo_url
                            ? `http://localhost:5001${user.photo_url}`
                            : "http://localhost:5001/uploads/default-user-pic.png"
                    }
                    alt="user profile"
                />
                <div className="user-details">
                    <p className="user-name">{user.user_name || "User"}</p>
                    <span className="user-dropdown">▼</span>
                </div>
            </div>
            {showNotifications && (
                <div className="notifications-popup" ref={popupRef}>
                    <Notifications />
                    <button className="close-btn" onClick={toggleNotifications}>Close</button>
                </div>
            )}
        </div>
    );
}