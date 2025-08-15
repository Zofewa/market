import VerticalBar from "../components/vertbar";
import RecentCustomers from "../components/recentcustomers";
import WasteVolume from "../components/wastevolume";
import User from "../components/user";
import Menu from "../components/menu";
import { useEffect, useState } from "react";
import axios from "axios";
import { isNull } from "lodash";
import { useNavigate } from "react-router-dom";
import AppName from "../components/appname";
import ReadersBoard from "../components/readersboard";


const Dashboard = () =>{
    const navigate = useNavigate();
    const [totalListings, setListings] = useState(0);
    const [totalValue, setTotalValue] = useState(0);
    const [listingHistory, setHistory] = useState([])
    const [chatThreads, setChatThreads] = useState([]);
    const [positions, setpositions] = useState([]);
    const [user, setUser] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTotal= async() =>{
        try {
            const totalListings = await axios.get("http://localhost:5001/api/total-listings", {withCredentials: true});
            setListings(totalListings.data.total);
            if(isNull(totalListings.data.sum))  {
                setTotalValue(0);
            }else{
                setTotalValue(totalListings.data.sum);
            }
        } catch (error) {
            setHistory([])
        }finally{
            setLoading(false);
        }
    }

    

    

    useEffect(() => {
        const fetchThreads = async () => {
            try {
            const res = await axios.get("http://localhost:5001/api/recent-threads", { withCredentials: true });
            setChatThreads(res.data);
            } catch {
            setChatThreads([]);
            }finally{
                setLoading(false);
            }
        };
        fetchThreads();
    }, []);


    useEffect(() => {
        const fetchItems = async() => {
            try {
                const history = await axios.get(`http://localhost:5001/api/items`, {withCredentials: true});
                setHistory(Array.isArray(history.data) ? history.data : []);
            } catch (error) {
                
            }finally{
                setLoading(false);
            }
        }
        fetchItems();
    }, [])


    useEffect(()=>{
        fetchTotal();
    })

    const getUser = async() => {
        try {
            const res = await axios.get("http://localhost:5001/user", {withCredentials: true});
            setUser(res.data);
        } catch (error) {
            
        }
    }

    useEffect(() => {
        getUser();
    }, [])


    const fetchPositions = async() => {
        try {
            const result = await axios.get("http://localhost:5001/api/score", {withCredentials: true});
            setpositions(result.data);
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        fetchPositions();
    }, [])

    if (loading){
        return <div className="loading">
            <div className="container">
                <p className="loader-logo">♻</p>
                <p>Loading <span className="dot">.</span><span className="dot">.</span><span className="dot">.</span></p>
            </div>
        </div>
    }

    const formatDate = (givenDate) => {
        const date = new Date(givenDate);
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    }

    return(
        <>
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
                        <div className= "k">
                            <h3 className="page-name">Dashboard</h3>
                            <div className="dashboard-items">
                                <div>
                                    <div className="counts-modern">
                                        <div className="count-card">
                                            <div className="count-icon" style={{ background: "#e8f5e9", color: "#388e3c" }}>📦</div>
                                            <div>
                                                <h5>Total Listings</h5>
                                                <h2>{totalListings}</h2>
                                            </div>
                                        </div>
                                        <div className="count-card">
                                            <div className="count-icon" style={{ background: "#ede7f6", color: "#7e57c2" }}>🏁</div>
                                            <div>
                                                <h5>LeaderBoard Position</h5>
                                                {positions.map((position) => (
                                                    <h2 key={position.id}> {user.id == position.id && (
                                                        <span>
                                                            <span>{position.position} </span><span style={{color: "yellow", fontSize: "large"}}>{position.points} pts</span>
                                                        </span>
                                                    )} </h2>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="count-card">
                                            <div className="count-icon" style={{ background: "#fffde7", color: "#fbc02d" }}>💰</div>
                                            <div>
                                                <h5>Value of Your Listings</h5>
                                                <h2>MK {totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
                                            </div>
                                        </div>
                                    </div>
                                    <WasteVolume />
                                    <div className="listing-history-table">
                                            <h5>Recent Listings</h5>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Date</th>
                                                    <th>Category</th>
                                                    <th>Price</th>
                                                </tr>
                                            </thead>
                                                <tbody>
                                                    {(listingHistory.length >0)?(
                                                        listingHistory.map((item) => (
                                                        <tr key={item.product_id}>
                                                            <td>{formatDate(item.date_added)}</td>
                                                            <td>{item.category}</td>
                                                            <td>{item.price}</td>
                                                        </tr>
                                                    ))
                                                    ): <tr><td>When you add items some will appear here!!</td></tr>}
                                                </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className="bottom">
                                    <ReadersBoard />
                                    <div className="recent-chats-card">
                                        <div className="recent-chats-header">
                                            <h4>Recent Chats</h4>
                                            <button
                                                className="see-all-btn"
                                                onClick={() => navigate('/chat')}
                                                title="Go to all chats"
                                            >
                                                See all
                                            </button>
                                        </div>
                                        {chatThreads.length > 0 ? (
                                            <div className="recent-chats-list">
                                                {chatThreads.slice(0, 5).map((threads) => (
                                                    <RecentCustomers key={threads.textId} threads={threads} />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="no-chats-msg">No recent chats!</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Dashboard;