import React from "react";

export default function Testimonials({ testimonials }) {
    return (
        <div className="testimonials-section">
            <h3>What Our Users Say</h3>
            <div className="testimonials-list">
                {testimonials.map((t, idx) => (
                    <div className="testimonial-card" key={idx}>
                        <p className="testimonial-text">"{t.text}"</p>
                        <p className="testimonial-name">- {t.name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}