import { useNavigate } from "react-router-dom";

interface NavbarProps {
  username: string;
  onLogout: () => Promise<void>;
}

function Navbar({ username, onLogout }: NavbarProps) {
  const navigate = useNavigate();

  if (username) {
    return (
      <nav className="landing-navbar">
        <div className="navbar-brand">SnowGo</div>
        <div className="navbar-content">
          <span className="greeting">Hi {username}!</span>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
          <button 
            className="settings-btn" 
            onClick={() => navigate("/settings")}
            title="Settings"
          >
            ⚙️
          </button>
        </div>
      </nav>
    );
  }

  return (
    <nav className="landing-navbar">
      <div className="navbar-brand">SnowGo</div>
      <div className="navbar-content login-signup-buttons">
        <button className="logout-btn" onClick={() => navigate("/login")}>
          Log In
        </button>
        <button className="logout-btn" onClick={() => navigate("/signup")}>
          Sign Up
        </button>
        <button 
            className="settings-btn" 
            onClick={() => navigate("/settings")}
            title="Settings"
          >
            ⚙️
          </button>
      </div>
    </nav>
  );
}

export default Navbar;
