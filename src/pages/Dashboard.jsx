
import React, { useEffect, useMemo, useState } from 'react'
import { AppBar, Toolbar, Typography, Box, Container, Button, Card, CardContent, IconButton, TextField, Grid, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Alert } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import LogoutIcon from '@mui/icons-material/Logout'
import api from '../api'
import { clearToken } from '../auth'
import dayjs from 'dayjs'

export default function Dashboard(){
  const [households, setHouseholds] = useState([])
  const [selected, setSelected] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [balances, setBalances] = useState([])
  const [settlements, setSettlements] = useState([])
  const [month, setMonth] = useState(dayjs().month()+1)
  const [year, setYear] = useState(dayjs().year())
  const [error, setError] = useState('')
  const [dlg, setDlg] = useState(false)
  const [joinId, setJoinId] = useState('')
  const [expenseForm, setExpenseForm] = useState({ amount:'', description:'', category:'' })

  const loadHouseholds = async () => {
    const { data } = await api.get('/households')
    setHouseholds(data)
    if(!selected && data.length) setSelected(data[0].id)
  }
  const loadData = async () => {
    if(!selected) return
    const [ex, sum] = await Promise.all([
      api.get('/expenses', { params: { household_id: selected, month, year } }),
      api.get('/summary', { params: { household_id: selected, month, year } })
    ])
    setExpenses(ex.data)
    setBalances(sum.data.balances)
    setSettlements(sum.data.settlements)
  }
  useEffect(()=>{ loadHouseholds() },[])
  useEffect(()=>{ loadData() },[selected, month, year])

  const logout = () => { clearToken(); window.location.href='/login' }

  const createHousehold = async () => {
    const name = prompt('Household name (e.g., 1BHK Room)')
    if(!name) return
    await api.post('/households', { name })
    await loadHouseholds()
  }
  const doJoin = async () => {
    try{
      setError('')
      await api.post('/households/join', { householdId: Number(joinId) })
      setDlg(false)
      setJoinId('')
      await loadHouseholds()
    }catch(e){
      setError('Failed to join. Check ID.')
    }
  }
  const addExpense = async () => {
    if(!expenseForm.amount) return
    await api.post('/expenses', { ...expenseForm, household_id: selected, amount: Number(expenseForm.amount), date: new Date() })
    setExpenseForm({ amount:'', description:'', category:'' })
    setDlg(false)
    await loadData()
  }

  return (
    <Box sx={{ minHeight:'100vh', background: 'linear-gradient(180deg, #F7F7FB 0%, #FFFFFF 100%)' }}>
      <AppBar position="static" color="transparent" elevation={0} sx={{ backdropFilter: 'saturate(180%) blur(6px)', backgroundColor: 'rgba(255,255,255,0.72)' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow:1 }}>Roommate Split</Typography>
          <Button onClick={()=>setDlg('create')} variant="contained" startIcon={<AddIcon />} sx={{ mr:1 }}>New Household</Button>
          <Button onClick={()=>setDlg('join')} variant="outlined">Join by ID</Button>
          <IconButton onClick={logout} sx={{ ml:1 }}><LogoutIcon /></IconButton>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 4 }}>
        {error && <Alert severity="error" sx={{ mb:2 }}>{error}</Alert>}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', mb:2 }}>
                  <Box sx={{ display:'flex', gap:2, alignItems:'center' }}>
                    <TextField select SelectProps={{ native:true }} label="Household" value={selected || ''} onChange={e=>setSelected(Number(e.target.value))}>
                      {households.map(h => <option key={h.id} value={h.id}>{h.name} (ID: {h.id})</option>)}
                    </TextField>
                    <TextField select SelectProps={{ native:true }} label="Month" value={month} onChange={e=>setMonth(Number(e.target.value))}>
                      {Array.from({length:12},(_,i)=><option key={i+1} value={i+1}>{i+1}</option>)}
                    </TextField>
                    <TextField label="Year" type="number" value={year} onChange={e=>setYear(Number(e.target.value))} />
                  </Box>
                  <Button variant="contained" startIcon={<AddIcon />} onClick={()=>setDlg('expense')}>Add expense</Button>
                </Box>

                <Box>
                  {expenses.map(e => (
                    <Box key={e.id} sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', py:1.5, borderBottom:'1px solid #eee' }}>
                      <Box>
                        <Typography sx={{ fontWeight:600 }}>{e.description || 'Expense'}</Typography>
                        <Typography variant="body2" color="text.secondary">{e.category || 'General'} • {new Date(e.date).toLocaleDateString()} • Paid by {e.payer_name}</Typography>
                      </Box>
                      <Chip label={`₹ ${Number(e.amount).toFixed(2)}`} color="primary" variant="outlined" />
                    </Box>
                  ))}
                  {!expenses.length && <Typography color="text.secondary">No expenses yet.</Typography>}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Monthly summary</Typography>
                <Box sx={{ display:'flex', flexDirection:'column', gap:1.5 }}>
                  {balances.map(b => (
                    <Box key={b.user.id} sx={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <Typography sx={{ fontWeight:600 }}>{b.user.name}</Typography>
                      <Typography color={b.net >= 0 ? 'success.main' : 'error.main'} sx={{ fontWeight:700 }}>
                        {b.net >= 0 ? '+ ' : '- '}₹ {Math.abs(b.net).toFixed(2)}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Box sx={{ mt:3 }}>
                  <Typography variant="subtitle2" gutterBottom>Settle up</Typography>
                  {settlements.map((s, idx) => (
                    <Box key={idx} sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', py:0.5 }}>
                      <Typography variant="body2">{s.from.name} ➝ {s.to.name}</Typography>
                      <Chip label={`₹ ${s.amount.toFixed(2)}`} color="secondary" />
                    </Box>
                  ))}
                  {!settlements.length && <Typography color="text.secondary" variant="body2">All settled 🎉</Typography>}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Dialog open={!!dlg} onClose={()=>setDlg(false)} maxWidth="sm" fullWidth>
        {dlg==='create' && <>
          <DialogTitle>Create household</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary">Click "Create" to make a household and share its ID with your roommate so they can join.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={()=>setDlg(false)}>Cancel</Button>
            <Button variant="contained" onClick={async ()=>{ await createHousehold(); setDlg(false) }}>Create</Button>
          </DialogActions>
        </>}
        {dlg==='join' && <>
          <DialogTitle>Join by ID</DialogTitle>
          <DialogContent>
            <TextField autoFocus fullWidth label="Household ID" value={joinId} onChange={e=>setJoinId(e.target.value)} />
          </DialogContent>
          <DialogActions>
            <Button onClick={()=>setDlg(false)}>Cancel</Button>
            <Button variant="contained" onClick={doJoin}>Join</Button>
          </DialogActions>
        </>}
        {dlg==='expense' && <>
          <DialogTitle>Add expense</DialogTitle>
          <DialogContent sx={{ pt:1 }}>
            <TextField fullWidth label="Amount" type="number" value={expenseForm.amount} onChange={e=>setExpenseForm(f=>({ ...f, amount: e.target.value }))} sx={{ my:1 }} />
            <TextField fullWidth label="Description" value={expenseForm.description} onChange={e=>setExpenseForm(f=>({ ...f, description: e.target.value }))} sx={{ my:1 }} />
            <TextField fullWidth label="Category" value={expenseForm.category} onChange={e=>setExpenseForm(f=>({ ...f, category: e.target.value }))} sx={{ my:1 }} />
          </DialogContent>
          <DialogActions>
            <Button onClick={()=>setDlg(false)}>Cancel</Button>
            <Button variant="contained" onClick={addExpense}>Add</Button>
          </DialogActions>
        </>}
      </Dialog>
    </Box>
  )
}
