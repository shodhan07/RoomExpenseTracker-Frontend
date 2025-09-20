import React, { useState } from "react";
import { Box, Button, Typography, Card, CardContent, TextField, Alert, Link, AppBar, Toolbar } from "@mui/material";
import { setToken } from "../auth";
import api from "../api";
import "./AuthLanding.css";

export default function AuthLanding() {
    const [activeTab, setActiveTab] = useState(""); // "" means landing page only
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [registerName, setRegisterName] = useState("");
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const { data } = await api.post("/auth/login", { email: loginEmail, password: loginPassword });
            setToken(data.token);
            window.location.href = "/";
        } catch (err) {
            setError(err.response?.data?.error || "Login failed");
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const { data } = await api.post("/auth/register", { name: registerName, email: registerEmail, password: registerPassword });
            setToken(data.token);
            window.location.href = "/";
        } catch (err) {
            setError(err.response?.data?.error || "Registration failed");
        }
    };

    return (
        <Box className="auth-landing-container">
            {/* HEADER */}
            <AppBar position="static" className="auth-header">
                <Toolbar className="auth-toolbar">
                    <Typography variant="h6" className="auth-logo">
                        RoomExpense Tracker
                    </Typography>
                    <Box>
                        <Button
                            onClick={() => setActiveTab("login")}
                            className={`auth-header-btn ${activeTab === "login" ? "active" : ""}`}
                        >
                            Sign In
                        </Button>
                        <Button
                            onClick={() => setActiveTab("register")}
                            className={`auth-header-btn ${activeTab === "register" ? "active" : ""}`}
                        >
                            Sign Up
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* MAIN */}
            <Box className="auth-landing-main">
                {/* Left column: Landing text */}
                {/* Left column: Landing text with modern cards */}
                <Box className="landing-left">
                    <Typography variant="h3" className="landing-title">
                        Track & Split Expenses Easily
                    </Typography>
                    <Typography className="landing-subtitle">
                        Keep your roommates on the same page. Manage group expenses without hassle —
                        simple, transparent, and stress-free.
                    </Typography>

                    {/* Feature cards */}
                    <Box className="landing-features-grid">
                        <Box className="feature-card">
                            <span className="feature-icon">💸</span>
                            <Typography variant="h6">Smart Bill Splitting</Typography>
                            <Typography variant="body2">Divide expenses fairly with roommates or friends.</Typography>
                        </Box>
                        <Box className="feature-card">
                            <span className="feature-icon">📊</span>
                            <Typography variant="h6">Track History</Typography>
                            <Typography variant="body2">See who paid what & keep a full payment record.</Typography>
                        </Box>
                        <Box className="feature-card">
                            <span className="feature-icon">⚡</span>
                            <Typography variant="h6">Fast & Simple</Typography>
                            <Typography variant="body2">Clean interface that makes expense tracking easy.</Typography>
                        </Box>
                    </Box>

                    {/* Call to action */}
                    <Button
                        onClick={() => setActiveTab("register")}
                        className="cta-button"
                    >
                        Start Tracking Now
                    </Button>
                </Box>


                {/* Right column: Card (only show if activeTab) */}
                <Box className="landing-right">
                    {activeTab && (
                        <>
                            {activeTab === "login" && (
                                <Card className="auth-card slide-in">
                                    <CardContent>
                                        <Typography variant="h4" className="auth-title">Welcome Back</Typography>
                                        <Typography className="auth-subtitle">Log in to manage your expenses.</Typography>
                                        {error && <Alert severity="error" className="auth-error">{error}</Alert>}
                                        <Box component="form" onSubmit={handleLogin}>
                                            <TextField fullWidth label="Email" type="email" margin="normal" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
                                            <TextField fullWidth label="Password" type="password" margin="normal" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
                                            <Button fullWidth type="submit" className="auth-button">Log In</Button>
                                        </Box>
                                        <Typography className="auth-footer">
                                            New here? <Link onClick={() => setActiveTab("register")} className="auth-link">Create an account</Link>
                                        </Typography>
                                    </CardContent>
                                </Card>
                            )}
                            {activeTab === "register" && (
                                <Card className="auth-card slide-in">
                                    <CardContent>
                                        <Typography variant="h4" className="auth-title">Create Account</Typography>
                                        {error && <Alert severity="error" className="auth-error">{error}</Alert>}
                                        <Box component="form" onSubmit={handleRegister}>
                                            <TextField fullWidth label="Name" margin="normal" value={registerName} onChange={e => setRegisterName(e.target.value)} />
                                            <TextField fullWidth label="Email" type="email" margin="normal" value={registerEmail} onChange={e => setRegisterEmail(e.target.value)} />
                                            <TextField fullWidth label="Password" type="password" margin="normal" value={registerPassword} onChange={e => setRegisterPassword(e.target.value)} />
                                            <Button fullWidth type="submit" className="auth-button">Create Account</Button>
                                        </Box>
                                        <Typography className="auth-footer">
                                            Already have an account? <Link onClick={() => setActiveTab("login")} className="auth-link">Log in</Link>
                                        </Typography>
                                    </CardContent>
                                </Card>
                            )}
                        </>
                    )}
                </Box>
            </Box>

            {/* FOOTER */}
            <Box className="auth-footer-section">
                <Typography variant="body2">&copy; 2025 RoomExpense Tracker. All rights reserved.</Typography>
            </Box>
        </Box>
    );
}
