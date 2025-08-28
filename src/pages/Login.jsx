import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  Link,
} from "@mui/material";
import api from "../api";
import { setToken } from "../auth";
import "./Login.css";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setToken(data.token);
      nav("/");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <Box className="login-container">
      <Card className="login-card" elevation={6}>
        <CardContent>
          <Typography variant="h4" className="login-title" gutterBottom>
            Welcome Back
          </Typography>
          <Typography variant="body2" className="login-subtitle" gutterBottom>
            Log in to manage and track your expenses with ease.
          </Typography>

          {error && (
            <Alert severity="error" className="login-error">
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={onSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
            />
            <Button
              fullWidth
              size="large"
              variant="contained"
              type="submit"
              className="login-button"
            >
              Log In
            </Button>
          </Box>

          <Typography variant="body2" className="login-footer">
            New here?{" "}
            <Link component={RouterLink} to="/register" className="login-link">
              Create an account
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
