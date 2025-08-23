
import React, { useState } from 'react'
import { Box, Button, Card, CardContent, TextField, Typography, Link, Alert } from '@mui/material'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import api from '../api'
import { setToken } from '../auth'

export default function Register(){
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try{
      const { data } = await api.post('/auth/register', { name, email, password })
      setToken(data.token)
      nav('/')
    }catch(err){
      setError(err.response?.data?.error || 'Registration failed')
    }
  }
  return (
    <Box sx={{ minHeight: '100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'radial-gradient(90rem circle at 10% 10%, #e9e6ff, transparent), radial-gradient(60rem circle at 90% 20%, #e0fbff, transparent), #f7f7fb' }}>
      <Card sx={{ width: 460 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>Create your account</Typography>
          {error && <Alert severity="error" sx={{ mb:2 }}>{error}</Alert>}
          <Box component="form" onSubmit={onSubmit}>
            <TextField fullWidth label="Name" margin="normal" value={name} onChange={e=>setName(e.target.value)} />
            <TextField fullWidth label="Email" type="email" margin="normal" value={email} onChange={e=>setEmail(e.target.value)} />
            <TextField fullWidth label="Password" type="password" margin="normal" value={password} onChange={e=>setPassword(e.target.value)} />
            <Button fullWidth size="large" variant="contained" sx={{ mt: 2 }} type="submit">Create account</Button>
          </Box>
          <Typography variant="body2" sx={{ mt:2 }}>
            Already have an account? <Link component={RouterLink} to="/login">Log in</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
