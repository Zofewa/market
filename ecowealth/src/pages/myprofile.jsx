import VerticalBar from "../components/vertbar";
import User from "../components/user";
import Menu from "../components/menu";
import { useEffect, useState } from "react";
import axios from "axios";
import AppName from "../components/appname";

function MyProfile() {
    const [loading, setLoading] = useState(true);
    const [info, setInfo] = useState({
        image: null,
        preview: "",
    });
    const [user, setUser] = useState({});
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState({});
    const [successMsg, setSuccessMsg] = useState("");

    // Fetch user data
    const fetchUser = async () => {
        try {
            const response = await axios.get("http://localhost:5001/user", { withCredentials: true });
            setUser(response.data);
            console.log(response.data)
            setEditData({
                user_name: response.data.user_name || "",
                phone_number: response.data.phone_number || "",
                user_type: response.data.user_type || "",
            });
        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    // Handle profile image preview
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                setInfo({
                    image: file,
                    preview: event.target.result,
                });
            };
            reader.readAsDataURL(file);
        }
    };

    // Upload image and update profile photo
    const uploadImage = async (file) => {
        const formData = new FormData();
        formData.append("image", file);
        try {
            const res = await axios.post("http://localhost:5001/api/upload-image", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true,
            });
            return res.data;
        } catch (error) {
            return null;
        }
    };

    const handlePhotoUpload = async () => {
        setLoading(true);
        try {
            const photo_url = await uploadImage(info.image);
            if (photo_url) {
                await axios.post("http://localhost:5001/api/update-profile-photo", photo_url, { withCredentials: true });
                setInfo({ image: null, preview: "" });
                setSuccessMsg("Profile picture updated!");
                fetchUser();
            }
        } catch (error) {
            setSuccessMsg("Failed to update picture.");
        } finally {
            setLoading(false);
            setTimeout(() => setSuccessMsg(""), 2000);
        }
    };

    // Handle edit fields
    const handleEditChange = (e) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    // Save profile edits
    const handleSave = async () => {
        setLoading(true);
        try {
            await axios.post("http://localhost:5001/api/update-profile", editData, { withCredentials: true });
            setSuccessMsg("Profile updated!");
            setEditMode(false);
            fetchUser();
        } catch (error) {
            setSuccessMsg("Failed to update profile.");
        } finally {
            setLoading(false);
            setTimeout(() => setSuccessMsg(""), 2000);
        }
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="container">
                    <p className="loader-logo">♻</p>
                    <p>Loading <span className="dot">.</span><span className="dot">.</span><span className="dot">.</span></p>
                </div>
            </div>
        );
    }

    return (
        <div className="view-container">
            <div className="market">
                <div className="header">
                    <div>
                        <div className="app-name"><AppName /></div>
                        <p><Menu /></p>
                    </div>
                    <User />
                </div>
                <div className="market-body">
                    <VerticalBar />
                    <div className="k">
                        <h3 className="page-name">My Profile</h3>
                        <div className="profile-card">
                            <div className="profile-pic-section">
                                <img
                                    className="profile-pic"
                                    src={
                                        info.preview
                                            ? info.preview
                                            : user.photo_url
                                                ? `http://localhost:5001${user.photo_url}`
                                                : "http://localhost:5001/uploads/default-user-pic.png"
                                    }
                                    alt="Profile"
                                />
                                <label className="file-input-label">
                                    Change Picture
                                    <input
                                        type="file"
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        onChange={handleFileChange}
                                    />
                                </label>
                                {info.preview && (
                                    <button className="upload-btn" onClick={handlePhotoUpload}>
                                        Upload
                                    </button>
                                )}
                            </div>
                            <div className="profile-details-section">
                                {successMsg && <div className="profile-success">{successMsg}</div>}
                                <div className="profile-fields">
                                    <label>User Name:</label>
                                    {editMode ? (
                                        <input
                                            type="text"
                                            name="user_name"
                                            value={editData.user_name}
                                            onChange={handleEditChange}
                                        />
                                    ) : (
                                        <span>{user.user_name}</span>
                                    )}
                                </div>
                                <div className="profile-fields">
                                    <label>Phone Number:</label>
                                    {editMode ? (
                                        <input
                                            type="text"
                                            name="phone_number"
                                            value={`0${editData.phone_number}`}
                                            onChange={handleEditChange}
                                            maxLength={10}
                                            disabled
                                        />
                                    ) : (
                                        <span>0{user.phone_number}</span>
                                    )}
                                </div>
                                <div className="profile-fields">
                                    <label>User Type:</label>
                                    {editMode ? (
                                        <select
                                            name="user_type"
                                            value={editData.user_type}
                                            onChange={handleEditChange}
                                        >
                                            <option value="individual">Individual</option>
                                            <option value="company">Company</option>
                                        </select>
                                    ) : (
                                        <span>{user.user_type}</span>
                                    )}
                                </div>
                                <div className="profile-fields">
                                    <label>Member Since:</label>
                                    <span>{user.registered_date? new Date(user.registered_date).toLocaleDateString() : "N/A"}</span>
                                </div>
                                <div className="profile-actions">
                                    {editMode ? (
                                        <>
                                            <button className="save-btn" onClick={handleSave}>Save</button>
                                            <button className="cancel-btn" onClick={() => setEditMode(false)}>Cancel</button>
                                        </>
                                    ) : (
                                        <button className="edit-btn" onClick={() => setEditMode(true)}>Edit Profile</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MyProfile;