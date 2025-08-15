import NavBar from "../components/navbar";
import { useNavigate } from "react-router-dom";

const courses = [
    {
        id: 1,
        title: "Upcycle Plastics: Make Eco-Bricks & Crafts",
        description: "Learn how to turn plastic waste into eco-bricks, home decor, and marketable crafts.",
        level: "Beginner",
        duration: "2 weeks",
        image: "/images/plastic-course.jpg"
    },
    {
        id: 2,
        title: "E-Waste Art & Repairs",
        description: "Discover creative ways to repurpose old electronics and basic repair skills for resale.",
        level: "Intermediate",
        duration: "3 weeks",
        image: "/images/ewaste-course.jpg"
    },
    {
        id: 3,
        title: "Organic Waste: Compost & Urban Farming",
        description: "Turn kitchen and garden waste into compost and learn urban farming for profit.",
        level: "Beginner",
        duration: "1 week",
        image: "/images/organic-course.jpg"
    },
    {
        id: 4,
        title: "Metal & Glass: DIY Home Utilities",
        description: "Transform scrap metal and glass into useful home items and art you can sell.",
        level: "Advanced",
        duration: "4 weeks",
        image: "/images/metal-glass-course.jpg"
    }
];

export default function Skills() {
    const navigate = useNavigate();

    return (
        <>
            <NavBar />
            <section className="skills-hero">
                <div className="skills-hero-content">
                    <h1>Skill Development Courses</h1>
                    <p>
                        Unlock your potential! Learn how to repurpose waste into valuable products and start earning cash. 
                        Our expert-led courses guide you step-by-step, whether you’re a beginner or looking to master new techniques.
                    </p>
                </div>
            </section>
            <section className="skills-courses-section">
                <div className="skills-courses-list">
                    {courses.map(course => (
                        <div className="skills-course-card" key={course.id}>
                            <img src={course.image} alt={course.title} className="skills-course-image" />
                            <div className="skills-course-info">
                                <h3>{course.title}</h3>
                                <p>{course.description}</p>
                                <div className="skills-course-meta">
                                    <span className="skills-course-level">{course.level}</span>
                                    <span className="skills-course-duration">{course.duration}</span>
                                </div>
                                <button
                                    className="skills-enroll-btn"
                                    onClick={() => navigate(`/courses/${course.id}`)}
                                >
                                    Learn More
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
}