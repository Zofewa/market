


function Notifications() {
  return (
    <div className="notifications-list">
        <div className="notification-item">
            <p className="notification-message">You have a new message from Prosper Black.</p>
            <span className="notification-time">2 minutes ago</span>
        </div>
        <div className="notification-item">
            <p className="notification-message">Your item has been sold!</p>
            <span className="notification-time">5 minutes ago</span>
        </div>
        <div className="notification-item">
            <p className="notification-message">New comment on your listing.</p>
            <span className="notification-time">10 minutes ago</span>
        </div>
        <div className="notification-item">
            <p className="notification-message">Your profile has been updated.</p>
            <span className="notification-time">15 minutes ago</span>
        </div>
        <div className="notification-item">
            <p className="notification-message">You have a new follower.</p>
            <span className="notification-time">20 minutes ago</span>
        </div>
        <div className="notification-item">
            <p className="notification-message">Your listing has been approved.</p>
            <span className="notification-time">30 minutes ago</span>
        </div>
    </div>
  )
}

export default Notifications