import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { auth } from "../lib/api"

function Signup({ onSuccess }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSignup = async (e) => {
    if (e) e.preventDefault()
    if (!email || !password || loading) return

    setLoading(true);
    try {
      const data = await auth.signup(email, password);
      if (data.error) {
        alert(data.error);
        return;
      }

      alert("Account created successfully!");
      if (onSuccess) onSuccess(data);
      navigate("/dashboard")
    } catch (error) {
      alert("Signup failed: " + error.message);
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="login-container">
      <div className="login-card">
        <div className="card-header pb-2">
          <h2>Create Account</h2>
          <p className="subtitle">Join 1,000+ others finding flatmates today</p>
        </div>
        <div className="card-body pt-6">
          <form onSubmit={handleSignup}>
            <div className="input-group">
              <label className="saas-label">Email Address</label>
              <input
                type="email"
                className="saas-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="saas-label">Password</label>
              <input
                type="password"
                className="saas-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="saas-btn" disabled={loading}>
              {loading ? (
                <div className="btn-loading flex items-center justify-center gap-2">
                  <div className="spinner-xs"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                <>
                  <span className="btn-text">Get Started</span>
                </>
              )}
            </button>
          </form>
        </div>
        <div className="auth-footer-saas">
          <p className="text-sm text-center">
            Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Signup
