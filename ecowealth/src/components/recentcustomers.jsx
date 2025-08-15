import { useNavigate } from "react-router-dom";

export default function RecentCustomers({ threads }) {
    const navigate = useNavigate();
    const goToChat = () => {
        navigate(`/chat?thread=${threads.textId}`);
    };
    return (
        <div className="recent-customer" onClick={goToChat} tabIndex={0} title={`Chat with ${threads.pName}`}>
            <img
                className="recent-customer-avatar"
                src={threads.photo_url ? `http://localhost:5001${threads.photo_url}` : "http://localhost:5001/uploads/default-user-pic.png"}
                alt={threads.pName}
            />
            <div className="recent-customer-info">
                <span className="recent-customer-name">{threads.pName}</span>
                {threads.lastMessage && (
                    <span className="recent-customer-last">{threads.lastMessage.slice(0, 32)}{threads.lastMessage.length > 32 ? "..." : ""}</span>
                )}
            </div>
        </div>
    );
}