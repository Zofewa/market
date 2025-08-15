import NavBar from "../components/navbar";

export default function About() {
    return (
        <>
            <NavBar />
            <section className="about-section">
                <div className="about-container">
                    <h1>About EcoCycle Hub</h1>
                    <p>
                        EcoCycle Hub is a platform dedicated to connecting people and businesses to trade, recycle, and give new life to reusable materials. 
                        Our mission is to make recycling easy, rewarding, and accessible for everyone.
                    </p>
                    <ul className="about-list">
                        <li>🌱 Empower communities to reduce waste</li>
                        <li>♻ Promote sustainable trading and upcycling</li>
                        <li>💡 Share knowledge and eco-friendly tips</li>
                        <li>🤝 Connect buyers and sellers for a greener future</li>
                    </ul>
                    <p>
                        Join us in making a positive impact on the planet—one item at a time!
                    </p>
                </div>
            </section>
        </>
    );
}