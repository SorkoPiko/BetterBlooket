import Auth from "./pages/auth/Auth";
import Home from "./pages/Home";
import { AuthProvider } from "./context/AuthContext";
import { Routes, Route } from "react-router-dom";
import AuthRoute from "./AuthRoute";
import "./App.css";

function App() {
    return <AuthProvider>
        <Routes>
            <Route path="/" element={<Home />}></Route>
            <Route path="/login" element={<Auth />}></Route>
        </Routes>
    </AuthProvider>
}

export default App;
