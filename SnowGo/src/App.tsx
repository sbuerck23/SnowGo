import { Routes, Route } from "react-router-dom";
import Home from "./Home/Home";
import Login from "./Login/Login";
import Register from "./Register/Register";
import UserType from "./UserType/UserType";
import ProtectedRoute from "./ProtectedRoute/ProtectedRoute";
import { Analytics } from "@vercel/analytics/react";

function App() {
  return (
    <>
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
      </Routes>
      <Analytics />
    </>
  );
}

export default App;
