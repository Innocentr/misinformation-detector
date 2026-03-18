import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register"; 
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Layout from "./components/Layout";

function App() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC ROUTES - No Sidebar */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} /> 

        {/* PROTECTED ROUTES - Wrapped in the Sidebar Layout */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;