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
import Play from "./pages/play/Play";
import GameSet from "./pages/dashboard/GameSet";
import Host from "./pages/host/Host";
import Landing from "./pages/host/Landing";
import Assign from "./pages/host/Assign";
import { GameLayout } from "./context/GameContext";
import HostSettings from "./pages/host/Settings";
import HostLobby from "./pages/host/Join";

function App() {
    return <AuthProvider>
        <Routes>
            <Route path="/" element={<Home />}></Route>
            <Route path="/login" element={<Auth />}></Route>
            <Route path="/stats" element={<AuthRoute><Stats /></AuthRoute>}></Route>
            <Route path="/blooks" element={<AuthRoute><Blooks /></AuthRoute>}></Route>
            <Route path="/market" element={<AuthRoute><Market /></AuthRoute>}></Route>
            <Route path="/discover" element={<AuthRoute><Discover /></AuthRoute>}></Route>
            <Route path="/set/:setId" element={<AuthRoute><GameSet /></AuthRoute>}></Route>
            <Route path="/create" element={<AuthRoute><SetCreator /></AuthRoute>}></Route>
            <Route path="/sets" element={<AuthRoute><Sets /></AuthRoute>}></Route>
            <Route path="/favorites" element={<AuthRoute><Favorites /></AuthRoute>}></Route>
            <Route path="/settings" element={<AuthRoute><Settings /></AuthRoute>}></Route>
            <Route element={<GameLayout />}>
                <Route path="/play" element={<Play />}></Route>
                <Route path="/host" element={<AuthRoute><Host /></AuthRoute>}></Route>
                <Route path="/host/assign" element={<AuthRoute><Assign /></AuthRoute>}></Route>
                <Route path="/host/landing/:gameMode" element={<AuthRoute><Landing /></AuthRoute>}></Route>
                <Route path="/host/settings" element={<AuthRoute><HostSettings /></AuthRoute>}></Route>
                <Route path="/host/join" element={<AuthRoute><HostLobby /></AuthRoute>}></Route>
            </Route>
            <Route path="/*" element={<Navigate to="/"></Navigate>}></Route>
        </Routes>
    </AuthProvider>
}

export default App;
