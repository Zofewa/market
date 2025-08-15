import NavBar from "../components/navbar";
import { useState } from "react";

export default function Contact() {
    const [form, setForm] = useState({ name: "", email: "", message: "" });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = e => {
        e.preventDefault();
        // Here you would send the form data to your backend or email service
        setSubmitted(true);
    };

    return (
        <>
            <NavBar />
            <section className="contact-section">
                <div className="contact-container">
                    <h1>Contact Us</h1>
                    <p>
                        Have a question, suggestion, or need help? Fill out the form below and our team will get back to you soon!
                    </p>
                    {submitted ? (
                        <div className="contact-success">
                            <h3>Thank you!</h3>
                            <p>Your message has been sent. We'll be in touch soon.</p>
                        </div>
                    ) : (
                        <form className="contact-form" onSubmit={handleSubmit}>
                            <label htmlFor="name">Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                required
                            />
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                            <label htmlFor="message">Message</label>
                            <textarea
                                id="message"
                                name="message"
                                rows={5}
                                value={form.message}
                                onChange={handleChange}
                                required
                            />
                            <button type="submit" className="contact-btn">Send Message</button>
                        </form>
                    )}
                </div>
            </section>
        </>
    );
}