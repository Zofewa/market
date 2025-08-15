export default function PeopleOnChat({ person }) {
    // If opened is 'no', add 'unread' class for blinking
    const isUnread = person.opened === "no";

    return (
        <div className={isUnread ? "chat-card unread" : "chat-card"}>
            <img
                src={
                    person.photo_url
                        ? `http://localhost:5001${person.photo_url}`
                        : `http://localhost:5001/uploads/default-user-pic.png`
                }
                alt="person profile pic"
            />
            <div>
                <div className="user-sms">
                    <h5>{person.pName}</h5>
                    <p className="last-message">{person.lastMessage}</p>
                </div>
                
                {isUnread && <span className="unread-dot" />}
            </div>
        </div>
    );
}