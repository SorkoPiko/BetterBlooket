import Auth from "./pages/auth/Auth";
import Home from "./pages/Home";
import { AuthProvider } from "./context/AuthContext";
import { Routes, Route } from "react-router-dom";
import AuthRoute from "./AuthRoute";
import "./App.css";
import Stats from "./pages/dashboard/Stats";

function App() {
    return <AuthProvider>
        <Routes>
            <Route path="/" element={<Home />}></Route>
            <Route path="/login" element={<Auth />}></Route>
            <Route path="/stats" element={<AuthRoute><Stats /></AuthRoute>}></Route>
        </Routes>
    </AuthProvider>
}

export default App;
