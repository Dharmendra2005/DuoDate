import { useState } from 'react';
import { useNavigate } from 'react-router';
import Home from '../Home';
import './SignIn.css';

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSignIn = async (e) => {
        e.preventDefault();

        if (!email.trim() || !password.trim()) {
            alert("Please enter both email and password.");
            return;
        }

        const payload = { email, password };

        try {
            const response = await fetch("http://localhost:3000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            console.log("Login response:", data);

            if (response.ok) {
                localStorage.setItem("userEmail", email);
                alert("Login successful!");

                if (data.user.hasProfile) {
                    navigate("/create-duo");
                } else {
                    navigate("/profile-maker");
                }
            } else {
                alert(data.message || "Invalid credentials. Please try again.");
            }
        } catch (error) {
            console.error("Login connection error:", error);
            alert("Note: Connecting to backend failed. Proceeding with demo login.");
            localStorage.setItem("userEmail", email);
            navigate("/profile-maker");
        }
    };

    return (
        <div className="signin-page-wrapper">
            {/* Actual Home page in the background, blurred and not focused */}
            <div className="signin-backdrop-blurred">
                <Home />
            </div>

            {/* Focus Modal Dialog */}
            <div className="signin-modal-overlay">
                <div className="signin-modal-card">
                    <button type="button" className="signin-close-btn" onClick={() => navigate('/')}>✕</button>

                    <h2>Enter email and password</h2>

                    <form onSubmit={handleSignIn}>
                        <div className="signin-field-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="signin-field-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="signin-submit-btn">NEXT</button>
                    </form>

                    <a href="#forgot" className="forgot-password-link">FORGOT PASSWORD?</a>

                    <div className="signin-divider">
                        <span className="divider-line"></span>
                        <span className="divider-text">or</span>
                        <span className="divider-line"></span>
                    </div>

                    <button type="button" className="phone-login-btn">LOG IN WITH PHONE</button>
                </div>
            </div>
        </div>
    );
};

export default SignIn;
