import { useNavigate } from "react-router-dom";
import snowGoLogo from "../assets/snowGoLogo.png";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <>
      <div className="home">
        <img src={snowGoLogo} alt="SnowGo Logo" width="500" height="500" />
        <button onClick={() => navigate("/login")}>Login</button>
        <button onClick={() => navigate("/signup")}>Sign Up</button>
      </div>
    </>
  );
}

export default Home;
