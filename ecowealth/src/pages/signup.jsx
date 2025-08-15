import { useNavigate, NavLink, Link } from "react-router-dom";
import { useState } from "react";
import axios from 'axios';

export default function SignUp() {
    const [values, setValues] = useState({
        fullname: "",
        phonenumber: "",
        user: "individual",
        password: "",
        repassword: ""
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverError, setServerError] = useState(null);
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setValues({ ...values, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!values.fullname.trim()) newErrors.fullname = "Username is required";
        if (!values.phonenumber.trim()) newErrors.phonenumber = "Phone number is required";
        if (!values.password) newErrors.password = "Password is required";
        if (values.password.length < 6) newErrors.password = "Password must be at least 6 characters";
        if (values.password !== values.repassword) newErrors.repassword = "Passwords don't match";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const postData = async (e) => {
        e.preventDefault();
        setServerError(null);

        if (!validate()) return;

        setIsSubmitting(true);

        try {
            const response = await axios.post('http://localhost:5001/signup', {
                user_name: values.fullname,
                phone_number: values.phonenumber,
                user_type: values.user,
                password: values.password
            }, { withCredentials: true });

            setSuccess(true);
        } catch (error) {
            if (error.response?.status === 409) {
                setServerError(error.response?.data?.message || "User name already exists, try another one.");
            } else {
                setServerError(error.response?.data?.message || "Registration failed. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="signup-bg">
                <div className="signup-card">
                    <h3>Registration Successful!</h3>
                    <p>Your account has been created successfully.</p>
                    <button className="login-btn" onClick={() => navigate('/signin')}>Proceed to Sign In</button>
                </div>
            </div>
        );
    }

    return (
        <div className="signup-bg">
            <div className="signup-card">
                <h2>Join EcoCycle Hub</h2>
                <p className="signup-welcome">Create your account and start making a difference!</p>
                <form onSubmit={postData} className="signup-form">
                    {serverError && <div className="error-message">{serverError}</div>}

                    <label htmlFor="fullname">User Name<sup>*</sup></label>
                    <input
                        type="text"
                        name="fullname"
                        id="fullname"
                        value={values.fullname}
                        onChange={handleChange}
                        autoComplete="username"
                    />
                    {errors.fullname && <span className="error">{errors.fullname}</span>}

                    <label htmlFor="phonenumber">Phone Number<sup>*</sup></label>
                    <input
                        type="tel"
                        name="phonenumber"
                        id="phonenumber"
                        value={values.phonenumber}
                        onChange={handleChange}
                        autoComplete="tel"
                    />
                    {errors.phonenumber && <span className="error">{errors.phonenumber}</span>}

                    <div className="user-type-group">
                        <input
                            type="radio"
                            name="user"
                            id="individual"
                            value="individual"
                            checked={values.user === "individual"}
                            onChange={handleChange}
                        />
                        <label htmlFor="individual">Individual</label>
                        <input
                            type="radio"
                            name="user"
                            id="company"
                            value="company"
                            checked={values.user === "company"}
                            onChange={handleChange}
                        />
                        <label htmlFor="company">Company</label>
                    </div>

                    <label htmlFor="password">Password<sup>*</sup></label>
                    <input
                        type="password"
                        name="password"
                        id="password"
                        value={values.password}
                        onChange={handleChange}
                        autoComplete="new-password"
                    />
                    {errors.password && <span className="error">{errors.password}</span>}

                    <label htmlFor="repassword">Retype Password<sup>*</sup></label>
                    <input
                        type="password"
                        name="repassword"
                        id="repassword"
                        value={values.repassword}
                        onChange={handleChange}
                        autoComplete="new-password"
                    />
                    {errors.repassword && <span className="error">{errors.repassword}</span>}

                    <button
                        type="submit"
                        className="login-btn"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Processing...' : 'Sign Up'}
                    </button>

                    <p className="terms-text">
                        By signing up you agree to our <Link>Terms</Link> and <Link>Conditions</Link>.
                    </p>
                    <div className="signup-links">
                        <span>Already have an account?</span>
                        <NavLink to='/signin' className="new-account">Sign in</NavLink>
                    </div>
                </form>
                <button className="back-btn" onClick={() => navigate(-1)}>&larr; Go Back</button>
            </div>
        </div>
    );
}