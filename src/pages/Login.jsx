
import React, { useState } from 'react'
import { Box, Button, Card, CardContent, TextField, Typography, Link, Alert } from '@mui/material'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import api from '../api'
import { setToken } from '../auth'

export default function Login(){
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try{
      const { data } = await api.post('/auth/login', { email, password })
      setToken(data.token)
      nav('/')
    }catch(err){
      setError(err.response?.data?.error || 'Login failed')
    }
  }
  return (
    <Box sx={{ minHeight: '100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'radial-gradient(90rem circle at 10% 10%, #e9e6ff, transparent), radial-gradient(60rem circle at 90% 20%, #e0fbff, transparent), #f7f7fb' }}>
      <Card sx={{ width: 420 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>Welcome back</Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>Log in to track and settle expenses effortlessly.</Typography>
          {error && <Alert severity="error" sx={{ mb:2 }}>{error}</Alert>}
          <Box component="form" onSubmit={onSubmit}>
            <TextField fullWidth label="Email" type="email" margin="normal" value={email} onChange={e=>setEmail(e.target.value)} />
            <TextField fullWidth label="Password" type="password" margin="normal" value={password} onChange={e=>setPassword(e.target.value)} />
            <Button fullWidth size="large" variant="contained" sx={{ mt: 2 }} type="submit">Log in</Button>
          </Box>
          <Typography variant="body2" sx={{ mt:2 }}>
            New here? <Link component={RouterLink} to="/register">Create an account</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
