import "./App.css";
import { Routes, Route } from "react-router-dom";
import Home from "./Home/Home";
import Login from "./Login/Login";
import Register from "./Register/Register";
import UserType from "./UserType/UserType";
import Landing from "./Landing/Landing";
import Booking from "./Booking/Booking";
import ProtectedRoute from "./ProtectedRoute/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Register />} />
      <Route
        path="/usertype"
        element={
          <ProtectedRoute requireAuth={false}>
            <UserType />
          </ProtectedRoute>
        }
      />
      <Route path="/booking" element={<Booking />} />
      <Route
        path="/landing"
        element={
          <ProtectedRoute requireAuth={true}>
            <Landing />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
