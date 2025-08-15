import { useNavigate, NavLink } from "react-router-dom";
import axios from 'axios';
import { useState, useEffect } from "react";

export default function SignIn() {
    const [values, setValues] = useState({
        phone_number: "",
        password: "",
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverError, setServerError] = useState(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (success) {
            navigate("/dashboard");
        }
    }, [success, navigate]);

    const handleChange = (e) => {
        setValues({ ...values, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({...errors, [e.target.name]: null});
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!values.phone_number.trim()) newErrors.phone_number = "Phone number is required";
        if (!values.password) newErrors.password = "Password is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const postData = async (e) => {
        e.preventDefault();
        setServerError(null);
        if (!validate()) return;
        setIsSubmitting(true);
        try {
            const response = await axios.post(
                'http://localhost:5001/signin',
                values,
                { withCredentials: true }
            );
            if (response.data.message === "Logged in successfully") {
                setSuccess(true);
            }
        } catch (error) {
            if (error.response) {
                setServerError(error.response.data.error || "Login failed");
            } else {
                setServerError("Ooops. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="signin-bg">
            <div className="signin-container">
                <div className="signin-left">
                    <h1>Welcome Back!</h1>
                    <p>Sign in to continue your eco journey.<br />Not a member yet?</p>
                    <NavLink to='/signup' className="signup-link">Create Account</NavLink>
                </div>
                <div className="signin-right">
                    <form onSubmit={postData} className="signin-form">
                        <h2>Sign In</h2>
                        {serverError && <div className="error-message">{serverError}</div>}
                        <label htmlFor="phone_number">Phone Number</label>
                        <input
                            type="tel"
                            name="phone_number"
                            id="phone_number"
                            value={values.phone_number}
                            onChange={handleChange}
                            placeholder="Enter your phone number"
                            autoComplete="username"
                        />
                        {errors.phone_number && <span className="error">{errors.phone_number}</span>}
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            value={values.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                        />
                        {errors.password && <span className="error">{errors.password}</span>}
                        <button type="submit" className="login-btn" disabled={isSubmitting}>
                            {isSubmitting ? "Signing In..." : "Sign In"}
                        </button>
                        <div className="signin-links">
                            <NavLink to="/forgot-password" className="forgot-link">Forgot Password?</NavLink>
                            <button type="button" className="back-btn" onClick={() => navigate(-1)}>&larr; Go Back</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}