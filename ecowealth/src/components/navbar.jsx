import { useNavigate } from "react-router-dom";

export default function NavBar() {
    const navigate = useNavigate();
    return (
        <nav className="navbar">
            <div className="navbar-left" onClick={() => navigate('/')}>
                <span className="navbar-logo">♻</span>
                <span className="navbar-title">EcoCycle Hub</span>
            </div>
            <div className="navbar-center">
                <button className="nav-link" onClick={() => navigate('/')}>Home</button>
                <button className="nav-link" onClick={() => navigate('/skills')}>Learn</button>
                <button className="nav-link" onClick={() => navigate('/about')}>About</button>
                <button className="nav-link" onClick={() => navigate('/contact')}>Contact</button>
            </div>
            <div className="navbar-right">
                <button className="nav-auth" onClick={() => navigate('/signin')}>Sign in</button>
                <button className="nav-auth primary" onClick={() => navigate('/signup')}>Sign up</button>
            </div>
        </nav>
    );
}