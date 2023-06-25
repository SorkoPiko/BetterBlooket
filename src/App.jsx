import Auth from "./pages/auth/Auth";
import Home from "./pages/Home";
import { AuthProvider } from "./context/AuthContext";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthRoute from "./AuthRoute";
import "./App.css";
import Stats from "./pages/dashboard/Stats";
import Blooks from "./pages/dashboard/Blooks";
import Market from "./pages/dashboard/Market";
import Discover from "./pages/dashboard/Discover";
import SetCreator from "./pages/dashboard/SetCreator";
import Sets from "./pages/dashboard/Sets";
import Favorites from "./pages/dashboard/Favorites";
import Settings from "./pages/dashboard/Settings";

function App() {
    return <AuthProvider>
        <Routes>
            <Route path="/" element={<Home />}></Route>
            <Route path="/login" element={<Auth />}></Route>
            <Route path="/stats" element={<AuthRoute><Stats /></AuthRoute>}></Route>
            <Route path="/blooks" element={<AuthRoute><Blooks /></AuthRoute>}></Route>
            <Route path="/market" element={<AuthRoute><Market /></AuthRoute>}></Route>
            <Route path="/discover" element={<AuthRoute><Discover /></AuthRoute>}></Route>
            <Route path="/set-creator" element={<AuthRoute><SetCreator /></AuthRoute>}></Route>
            <Route path="/sets" element={<AuthRoute><Sets /></AuthRoute>}></Route>
            <Route path="/favorites" element={<AuthRoute><Favorites /></AuthRoute>}></Route>
            <Route path="/settings" element={<AuthRoute><Settings /></AuthRoute>}></Route>
            <Route path="/*" element={<Navigate to="/"></Navigate>}></Route>
        </Routes>
    </AuthProvider>
}

export default App;
