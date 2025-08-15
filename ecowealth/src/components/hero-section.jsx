import Image from '../assets/ndirande.jpg';
import { useNavigate } from "react-router-dom";

export default function HeroSection() {
    const navigate = useNavigate();

    return (
        <section className="hero-section">
            <div className="hero-content">
                <h1>
                    Turn Waste Into Opportunity<br />
                    <span className="hero-highlight">Join the Green Revolution</span>
                </h1>
                <p className="hero-subtext">
                    Discover, trade, and give new life to recyclable and reusable materials.<br />
                    Make a positive impact on the planet and your community today!
                </p>
                <button className="cta-btn" onClick={() => navigate('/signup')}>
                    Get Started
                </button>
            </div>
            <div className="hero-image-wrapper">
                <img className="hero-image" src={Image} alt="Recycling illustration" />
            </div>
        </section>
    );
}