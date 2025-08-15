import { useNavigate } from "react-router-dom"

function AppName() {
  const navigate = useNavigate();
  return (
      <div className="navbar-left" onClick={() => navigate('/dashboard')}>
          <span className="navbar-logo">♻</span>
          <span className="navbar-title">EcoCycle Hub</span>
      </div>
  )
}

export default AppName