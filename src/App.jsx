import { useEffect, useState } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { io } from "socket.io-client"
import { auth } from "./lib/api"
import Signup from "./pages/Signup"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Layout from "./components/Layout"

// Protected Route Component
const ProtectedRoute = ({ user, loading, children }) => {
  if (loading) return (
    <div className="loading-screen">
      <div className="spinner"></div>
    </div>
  );
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("suggestions")
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    if (user && !socket) {
      const newSocket = io(import.meta.env.VITE_API_URL || "http://localhost:3002");
      setSocket(newSocket);
      
      newSocket.on("connect", () => {
        newSocket.emit("authenticate", user.id);
      });

      return () => newSocket.close();
    }
  }, [user]);

  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'light';
    if (theme === 'dark') {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const data = await auth.getUser()
      if (data.user) {
        setUser(data.user)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await auth.logout()
    setUser(null)
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/signup" 
          element={<Signup onSuccess={(data) => setUser(data.user)} />} 
        />
        <Route 
          path="/login" 
          element={<Login onSuccess={(data) => setUser(data.user)} />} 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute user={user} loading={loading}>
              <Layout 
                user={user} 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                onLogout={handleLogout}
              >
                <Dashboard activeTab={activeTab} setActiveTab={setActiveTab} socket={socket} />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
