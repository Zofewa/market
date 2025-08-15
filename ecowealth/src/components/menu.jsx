import { useState } from "react"
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Image from "../assets/icons8-menu-48.png"

function Menu() {
    const navigate = useNavigate();
    const [menuToggled, setToggled] = useState(false);
    const [confirmBox, showConfirmBox] = useState(false);
    const toggleMenu = () => {
        setToggled(!menuToggled);
    };

    const toggleConfirm = () => {
        showConfirmBox(!confirmBox)
    }

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
                        <button onClick={handleLogout}>Continue</button>
                        <button onClick={toggleConfirm}>Cancel</button>
                    </div>
                </div>
            )}
            <img src={Image} alt="menu" className='menu' onClick={toggleMenu} />
            {menuToggled && (
                <div className="toggled-menu" >
                    <h2 onClick={toggleMenu}>⬅ Menu</h2>
                    <div className="content">
                        <div className="page-link" onClick={() => navigate('/dashboard')}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="red">
                                <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 8h14v-2H7v2zm0-4h14v-2H7v2zm0-6v2h14V7H7z" fill="currentColor"/>
                            </svg>
                            Dashboard
                        </div>
                        <div className="page-link" onClick={() => navigate('/marketplace')}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2zM7.16 14.26l.03-.12L7.9 12h8.45c.75 0 1.41-.41 1.75-1.03l3.24-5.88A1 1 0 0 0 21.45 4H5.21l-.94-2H1v2h2l3.6 7.59-1.35 2.44C4.52 15.37 5.48 17 7 17h12v-2H7.42c-.14 0-.25-.11-.26-.25z" fill="currentColor"/>
                            </svg>
                            Marketplace
                        </div>
                        <div className="page-link" onClick={() => navigate('/mylisting')}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-7-3h5v-2h-5v2zm0-4h5v-2h-5v2zm0-4h5V7h-5v2zm-4 8h2v-2H8v2zm0-4h2v-2H8v2zm0-4h2V7H8v2z" fill="currentColor"/>
                            </svg>
                            My Listings
                        </div>
                        <div className="page-link" onClick={() => navigate('/routes')}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Routes
                        </div>
                        <div className="page-link" onClick={() => navigate('/chat')}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M21 6.5a2.5 2.5 0 0 0-2.5-2.5h-13A2.5 2.5 0 0 0 3 6.5v11A2.5 2.5 0 0 0 5.5 20H19l2 2V6.5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                            </svg>
                            Chat
                        </div>
                        <div className="page-link" onClick={() => navigate('/myprofile')}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M12 12c2.7 0 8 1.34 8 4v2H4v-2c0-2.66 5.3-4 8-4zm0-2a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" fill="currentColor"/>
                            </svg>
                            Profile
                        </div>
                        <div className="page-link" onClick={toggleConfirm}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M16 13v-2H7V8l-5 4 5 4v-3h9zm3-10H5c-1.1 0-2 .9-2 2v6h2V5h14v14H5v-6H3v6c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" fill="currentColor"/>
                            </svg>
                            Log out
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Menu