import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
  Button,
  Card,
  CardContent,
  IconButton,
  TextField,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import LogoutIcon from "@mui/icons-material/Logout";
import api from "../api";
import { clearToken } from "../auth";
import dayjs from "dayjs";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./Dashboard.css";

export default function Dashboard() {
  const [households, setHouseholds] = useState([]);
  const [selected, setSelected] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [month, setMonth] = useState(dayjs().month() + 1);
  const [year, setYear] = useState(dayjs().year());
  const [error, setError] = useState("");
  const [dlg, setDlg] = useState(false);
  const [joinId, setJoinId] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(""); // NEW
  const [expenseForm, setExpenseForm] = useState({
    amount: "",
    description: "",
    category: "",
  });

  const loadHouseholds = async () => {
    const { data } = await api.get("/households");
    setHouseholds(data);
    if (!selected && data.length) setSelected(data[0].id);
  };

  const loadData = async () => {
    if (!selected) return;
    const [ex, sum] = await Promise.all([
      api.get("/expenses", {
        params: { household_id: selected, month, year },
      }),
      api.get("/summary", { params: { household_id: selected, month, year } }),
    ]);

    setExpenses(ex.data);

    // 🔹 Calculate how much each user paid (using paid_by column)
    const paidMap = ex.data.reduce((acc, e) => {
      acc[e.paid_by] = (acc[e.paid_by] || 0) + Number(e.amount);
      return acc;
    }, {});

    // 🔹 Merge totalPaid into balances
    const mergedBalances = sum.data.balances.map((b) => ({
      ...b,
      totalPaid: paidMap[b.user.id] || 0,  // match by user.id
    }));

    setBalances(mergedBalances);
    setSettlements(sum.data.settlements);
  };


  useEffect(() => {
    loadHouseholds();
  }, []);
  useEffect(() => {
    loadData();
  }, [selected, month, year]);

  const logout = () => {
    clearToken();
    window.location.href = "/login";
  };

  const createHousehold = async () => {
    const name = prompt("Household name (e.g., 1BHK Room)");
    if (!name) return;
    await api.post("/households", { name });
    await loadHouseholds();
  };

  const doJoin = async () => {
    try {
      setError("");
      await api.post("/households/join", { householdId: Number(joinId) });
      setDlg(false);
      setJoinId("");
      await loadHouseholds();
    } catch (e) {
      setError("Failed to join. Check ID.");
    }
  };

  const addExpense = async () => {
    if (!expenseForm.amount) return;
    await api.post("/expenses", {
      ...expenseForm,
      household_id: selected,
      amount: Number(expenseForm.amount),
      date: new Date(),
    });
    setExpenseForm({ amount: "", description: "", category: "" });
    setDlg(false);
    await loadData();
  };

  // ================= Pie Chart Data =================
  const COLORS = [
    "#3b82f6", // Food
    "#f97316", // Rent
    "#10b981", // Utilities
    "#000000", // Travel
    "#8b5cf6", // Shopping
    "#f43f5e", // Entertainment
    "#64748b", // Other
  ];

  const categoryTotals = expenses.reduce((acc, e) => {
    const cat = e.category || "Other";
    acc[cat] = (acc[cat] || 0) + Number(e.amount);
    return acc;
  }, {});

  const pieData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <Box className="dashboard-container">
      {/* Header */}
      <AppBar position="static" className="dashboard-appbar" elevation={0}>
        <Toolbar>
          <Typography variant="h6" className="logo">
            RoomExpense <span className="Tracker">Tracker</span>
          </Typography>
          <Box className="header-buttons">
            <Button
              onClick={() => setDlg("create")}
              variant="contained"
              startIcon={<AddIcon />}
            >
              New Household
            </Button>
            <Button
              onClick={() => setDlg("join")}
              variant="outlined"
              sx={{ ml: 2 }}
            >
              Join by ID
            </Button>
            <IconButton onClick={logout} className="logout-btn">
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main */}
      <Container className="dashboard-content">
        {error && (
          <Alert severity="error" className="error-alert">
            {error}
          </Alert>
        )}
        <Grid container spacing={3}>
          {/* Expenses */}
          <Grid item xs={12} md={7}>
            <Card className="card-section">
              <CardContent>
                <Box className="filters-bar">
                  <Box className="filters">
                    <TextField
                      select
                      SelectProps={{ native: true }}
                      label="Household"
                      value={selected || ""}
                      onChange={(e) => setSelected(Number(e.target.value))}
                    >
                      {households.map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.name} (ID: {h.id})
                        </option>
                      ))}
                    </TextField>
                    <TextField
                      select
                      SelectProps={{ native: true }}
                      label="Month"
                      value={month}
                      onChange={(e) => setMonth(Number(e.target.value))}
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </TextField>
                    <TextField
                      label="Year"
                      type="number"
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                    />
                    {/* Category Filter */}
                    <TextField
                      select
                      SelectProps={{ native: true }}
                      label="Category"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      fullWidth

                    >
                      <option value="">All</option>
                      <option value="Food">🍔 Food</option>
                      <option value="Rent">🏠 Rent</option>
                      <option value="Utilities">💡 Utilities</option>
                      <option value="Travel">✈️ Travel</option>
                      <option value="Shopping">🛍️ Shopping</option>
                      <option value="Entertainment">🎬 Entertainment</option>
                      <option value="Other">🔖 Other</option>
                    </TextField>

                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setDlg("expense")}
                  >
                    Add Expense
                  </Button>
                </Box>

                <Typography variant="h6" gutterBottom>
                  Expenses
                </Typography>
                <Box className="expense-list">
                  {expenses
                    .filter((e) => !categoryFilter || e.category === categoryFilter)
                    .map((e) => (
                      <Box key={e.id} className="expense-item">
                        <Box>
                          <Typography className="expense-title">
                            {e.description || "Expense"}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            className="expense-subtitle"
                          >
                            {e.category || "General"} •{" "}
                            {new Date(e.date).toLocaleDateString()} • Paid by{" "}
                            {e.payer_name}
                          </Typography>
                        </Box>
                        <Chip
                          label={`₹ ${Number(e.amount).toFixed(2)}`}
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                    ))}
                  {!expenses.length && (
                    <Typography color="text.secondary">
                      No expenses yet.
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Summary */}
          <Grid item xs={12} md={5}>
            <Card className="card-section">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Monthly Summary
                </Typography>

                <Box className="summary-list">
                  {balances.map((b) => (
                    <Box key={b.user.id} className="summary-item">
                      <Box>
                        <Typography className="summary-name">
                          {b.user.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Paid: ₹ {b.totalPaid?.toFixed(2) || 0}
                        </Typography>
                      </Box>
                      <Box textAlign="right">
                        <Typography
                          className={
                            b.net >= 0 ? "summary-positive" : "summary-negative"
                          }
                        >
                          {b.net >= 0 ? "Gets back" : "Owes"} ₹{" "}
                          {Math.abs(b.net).toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>

                <Box className="settle-section">
                  <Typography variant="subtitle2" gutterBottom>
                    Settlement
                  </Typography>
                  {settlements.map((s, idx) => (
                    <Box key={idx} className="settle-item">
                      <Typography variant="body2">
                        {s.from.name} should pay ₹ {s.amount.toFixed(2)} to{" "}
                        {s.to.name}
                      </Typography>
                    </Box>
                  ))}
                  {!settlements.length && (
                    <Typography
                      color="text.secondary"
                      variant="body2"
                      sx={{ mt: 1 }}
                    >
                      All settled
                    </Typography>
                  )}
                </Box>

                {/* Pie Chart Breakdown */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Expense Breakdown
                  </Typography>
                  {pieData.length ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}   // donut
                          outerRadius={100}
                          paddingAngle={4}
                          cornerRadius={6}
                          label={false}      // ❌ disables arrows + labels
                        >
                          {pieData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                              stroke="#fff"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>

                        {/* Tooltip on hover */}
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#fff",
                            borderRadius: "8px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                          }}
                          formatter={(value, name, props) => [
                            `₹${value}`,
                            `${name} (${((props.payload.value / pieData.reduce((a, b) => a + b.value, 0)) * 100).toFixed(0)}%)`
                          ]}
                        />

                        {/* Legend shows name + % */}
                        <Legend
                          verticalAlign="bottom"
                          align="center"
                          iconType="circle"
                          formatter={(value, entry) => {
                            const total = pieData.reduce((a, b) => a + b.value, 0);
                            const percent = ((entry.payload.value / total) * 100).toFixed(0);
                            return `${value} ${percent}%`;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>

                  ) : (
                    <Typography
                      color="text.secondary"
                      variant="body2"
                      sx={{ mt: 1 }}
                    >
                      No data to show 📊
                    </Typography>
                  )}
                </Box>


              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Dialogs */}
      <Dialog open={!!dlg} onClose={() => setDlg(false)} maxWidth="sm" fullWidth>
        {dlg === "create" && (
          <>
            <DialogTitle>Create household</DialogTitle>
            <DialogContent>
              <Typography variant="body2" color="text.secondary">
                Click "Create" to make a household and share its ID with your
                roommate so they can join.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDlg(false)}>Cancel</Button>
              <Button
                variant="contained"
                onClick={async () => {
                  await createHousehold();
                  setDlg(false);
                }}
              >
                Create
              </Button>
            </DialogActions>
          </>
        )}
        {dlg === "join" && (
          <>
            <DialogTitle>Join by ID</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                fullWidth
                label="Household ID"
                value={joinId}
                onChange={(e) => setJoinId(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDlg(false)}>Cancel</Button>
              <Button variant="contained" onClick={doJoin}>
                Join
              </Button>
            </DialogActions>
          </>
        )}
        {dlg === "expense" && (
          <>
            <DialogTitle>Add expense</DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={expenseForm.amount}
                onChange={(e) =>
                  setExpenseForm((f) => ({ ...f, amount: e.target.value }))
                }
                sx={{ my: 1 }}
              />
              <TextField
                fullWidth
                label="Description"
                value={expenseForm.description}
                onChange={(e) =>
                  setExpenseForm((f) => ({ ...f, description: e.target.value }))
                }
                sx={{ my: 1 }}
              />

              {/* Category Dropdown */}
              <TextField
                fullWidth
                select
                label="Category"
                value={expenseForm.category}
                onChange={(e) =>
                  setExpenseForm((f) => ({ ...f, category: e.target.value }))
                }
                sx={{ my: 1 }}
                SelectProps={{ native: true }}
                InputLabelProps={{ shrink: true }}
              >
                <option value="">Select category</option>
                <option value="Food">🍔 Food</option>
                <option value="Rent">🏠 Rent</option>
                <option value="Utilities">💡 Utilities</option>
                <option value="Travel">✈️ Travel</option>
                <option value="Shopping">🛍️ Shopping</option>
                <option value="Entertainment">🎬 Entertainment</option>
                <option value="Other">🔖 Other</option>
              </TextField>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDlg(false)}>Cancel</Button>
              <Button variant="contained" onClick={addExpense}>
                Add
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
