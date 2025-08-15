import React, { useState, useEffect, useRef } from "react";
import User from "../components/user";
import VerticalBar from "../components/vertbar";
import PeopleOnChat from "../components/peoplerecentonchat";
import Menu from "../components/menu";
import axios from "axios";
import { useLocation } from "react-router-dom";
import AppName from "../components/appname";
import EmojiPicker from "emoji-picker-react";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5001"; 



export default function Chat() {
  const [activeChat, setActiveChat] = useState(null);
  const [input, setInput] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [chatThreads, setChatThreads] = useState([]);
  const [search, setSearch] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const location = useLocation();
  const socketRef = useRef(null);

  function timeAgo(date) {
    if (!date) return "";
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now - then) / 1000); // seconds

    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return then.toLocaleDateString();
  }

  // Connect to socket.io on mount
  useEffect(() => {
    socketRef.current = io(SOCKET_URL, { withCredentials: true });
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  // Fetch chat threads
  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const res = await axios.get(`${SOCKET_URL}/api/chat-thread`, { withCredentials: true });
        setChatThreads(res.data);
      } catch {
        setChatThreads([]);
      } finally {
        setLoading(false);
      }
    };
    fetchThreads();
  }, []);

  // Fetch messages for the selected chat thread
  useEffect(() => {
    const fetchMessages = async () => {
      if (activeChat === null) {
        setMessages([]);
        return;
      }
      setLoading(true);
      try {
        const res = await axios.get(`${SOCKET_URL}/api/messages/${activeChat}`, { withCredentials: true });
        setMessages(res.data);
      } catch {
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [activeChat]);

  // Listen for incoming messages via socket
  useEffect(() => {
    if (!socketRef.current) return;
    const socket = socketRef.current;

    socket.on("receive_message", (msg) => {
      if (msg.threadId === activeChat) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.off("receive_message");
    };
  }, [activeChat]);

  // Scroll to bottom when new message arrives
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Send message via socket and HTTP for persistence
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() && activeChat !== null) {
      const tempMsg = {
        id: Date.now(),
        text: input,
        sender: "user",
        threadId: activeChat,
      };
      setMessages((prev) => [...prev, tempMsg]);
      setInput('');
      setShowEmoji(false);

      // Emit to socket for real-time
      socketRef.current.emit("send_message", tempMsg);

      // Persist to backend
      try {
        await axios.post(
          `${SOCKET_URL}/api/messages/${activeChat}`,
          { text: tempMsg.text },
          { withCredentials: true }
        );
      } catch {
        // Optionally show error or mark message as failed
      }
    }
  };

  const handleChatSelect = async (textId) => {
    setActiveChat(textId);
    try {
      await axios.get(`${SOCKET_URL}/api/messages/${textId}`, { withCredentials: true });
      setChatThreads((prev) =>
        prev.map(thread =>
          thread.textId === textId
            ? { ...thread, opened: "yes" }
            : thread
        )
      );
    } catch {}
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const thread = params.get("thread");
    if (thread) setActiveChat(Number(thread));
  }, [location.search]);

  const onEmojiClick = (emojiData) => {
    setInput((prev) => prev + emojiData.emoji);
  };

  if (loading) {
    return <div className="loading">
      <div className="container">
        <p className="loader-logo">♻</p>
        <p>Loading <span className="dot">.</span><span className="dot">.</span><span className="dot">.</span></p>
      </div>
    </div>
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
        <div className="market-body chat-body">
          <VerticalBar />
          <div className="k chat-main">
            <h3 className="page-name">Inbox</h3>
            <div className="chat">
              <div className="contacts">
                <h2>Conversations</h2>
                <div className="search-in-chat">
                  <input
                    type="text"
                    name="search-in-chat"
                    id="chat-search"
                    placeholder="Search chats..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <div className="chat-list">
                  {chatThreads
                    .filter(person => person.pName.toLowerCase().includes(search.toLowerCase()))
                    .map((person) => (
                      <div
                        key={person.textId}
                        onClick={() => handleChatSelect(person.textId)}
                        className={`chat-person ${activeChat === person.textId ? 'active' : ''}`}
                      >
                        <PeopleOnChat person={person} />
                      </div>
                    ))}
                </div>
              </div>
              <div className="message-area">
                {activeChat !== null ? (
                  <>
                    <div className="messages">
                      {messages.map((message, idx, arr) => (
                        <div
                          key={message.id || idx}
                          className={`message-bubble ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
                        >
                          <span className="message-content">{message.text}</span>
                          <span className="message-time">
                            {timeAgo(message.sent_at)}
                          </span>
                          {idx === arr.length - 1 && <div ref={messagesEndRef} />}
                        </div>
                      ))}
                    </div>
                    <div className="input-area">
                      <form onSubmit={handleSendMessage} className="input-form">
                        <button
                          type="button"
                          className="emoji-btn"
                          onClick={() => setShowEmoji((v) => !v)}
                          tabIndex={-1}
                        >😊</button>
                        {showEmoji && (
                          <div className="emoji-picker-popup">
                            <EmojiPicker onEmojiClick={onEmojiClick} height={350} width={300} />
                          </div>
                        )}
                        <input
                          type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="Type a message..."
                          className="message-input"
                        />
                        <button type="submit" className="send-button">
                          Send
                        </button>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="no-chat-selected">
                    <p>Select a conversation to start chatting</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}