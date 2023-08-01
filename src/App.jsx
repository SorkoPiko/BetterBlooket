import Auth from "./pages/auth/Auth";
import Home from "./pages/Home";
import { AuthProvider } from "./context/AuthContext";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthRoute from "./AuthRoute";
import "./App.css";
import ErrorBoundary from "./ErrorBoundary";
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
import Homeworks, { Homework } from "./pages/dashboard/Homework";
import Host from "./pages/host/Host";
import Landing from "./pages/host/Landing";
import Assign from "./pages/host/Assign";
import { GameLayout } from "./context/GameContext";
import HostSettings from "./pages/host/Settings";
import HostLobby from "./pages/host/Join";
import GoldHost, { GoldFinal, GoldInstruct } from "./pages/host/gamemodes/Gold";
import HackHost, { HackFinal, HackInstruct } from "./pages/host/gamemodes/Hack";
import FishHost, { FishFinal, FishInstruct } from "./pages/host/gamemodes/Fish";
import Defense2Host, { Defense2Final } from "./pages/host/gamemodes/Defense2";
import BrawlHost, { BrawlFinal } from "./pages/host/gamemodes/Brawl";
import DinoHost, { DinoFinal, DinoInstruct } from "./pages/host/gamemodes/Dino";
import DefenseHost, { DefenseFinal } from "./pages/host/gamemodes/Defense";
import CafeHost, { CafeFinal } from "./pages/host/gamemodes/Cafe";
import FactoryHost, { FactoryFinal } from "./pages/host/gamemodes/Factory";
import RacingHost, { RacingFinal } from "./pages/host/gamemodes/Racing";
import RushHost, { RushFinal, RushInstruct } from "./pages/host/gamemodes/Rush";
import HostTeams from "./pages/host/Teams";
import { RoyaleFinal, RoyaleInstruct, RoyaleMatchResults, RoyalePreview, RoyaleQuestion, RoyaleQuestionResults } from "./pages/host/gamemodes/Royale";
import { ClassicFinal, ClassicGetReady, ClassicQuestion, ClassicResults, ClassicStandings } from "./pages/host/gamemodes/Classic";
import HW from "./pages/host/HW";
import History, { GameHistory } from "./pages/dashboard/History";

function App() {
    return <AuthProvider>
        <ErrorBoundary fallback="/sets">
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
                <Route path="/homework" element={<AuthRoute><Homeworks /></AuthRoute>}></Route>
                <Route path="/homework/:id" element={<AuthRoute><Homework /></AuthRoute>}></Route>
                <Route path="/history" element={<AuthRoute><History /></AuthRoute>}></Route>
                <Route path="/history/game/:id" element={<AuthRoute><GameHistory /></AuthRoute>}></Route>
                <Route path="/settings" element={<AuthRoute><Settings /></AuthRoute>}></Route>
                <Route element={<GameLayout />}>
                    <Route path="/play" element={<Play />}></Route>
                    <Route path="/host" element={<AuthRoute><Host /></AuthRoute>}></Route>
                    <Route path="/hw" element={<AuthRoute><HW /></AuthRoute>}></Route>
                    <Route path="/host/assign" element={<AuthRoute><Assign /></AuthRoute>}></Route>
                    <Route path="/host/landing/:gameMode" element={<AuthRoute><Landing /></AuthRoute>}></Route>
                    <Route path="/host/settings" element={<AuthRoute><HostSettings /></AuthRoute>}></Route>
                    <Route path="/host/join" element={<AuthRoute><HostLobby /></AuthRoute>}></Route>
                    <Route path="/host/gold/instructions" element={<AuthRoute><GoldInstruct /></AuthRoute>}></Route>
                    <Route path="/host/gold" element={<AuthRoute><GoldHost /></AuthRoute>}></Route>
                    <Route path="/host/gold/final" element={<AuthRoute><GoldFinal /></AuthRoute>}></Route>
                    <Route path="/host/hack/instructions" element={<AuthRoute><HackInstruct /></AuthRoute>}></Route>
                    <Route path="/host/hack" element={<AuthRoute><HackHost /></AuthRoute>}></Route>
                    <Route path="/host/hack/final" element={<AuthRoute><HackFinal /></AuthRoute>}></Route>
                    <Route path="/host/fishing/instructions" element={<AuthRoute><FishInstruct /></AuthRoute>}></Route>
                    <Route path="/host/fishing" element={<AuthRoute><FishHost /></AuthRoute>}></Route>
                    <Route path="/host/fishing/final" element={<AuthRoute><FishFinal /></AuthRoute>}></Route>
                    <Route path="/host/defense2" element={<AuthRoute><Defense2Host /></AuthRoute>}></Route>
                    <Route path="/host/defense2/final" element={<AuthRoute><Defense2Final /></AuthRoute>}></Route>
                    <Route path="/host/brawl" element={<AuthRoute><BrawlHost /></AuthRoute>}></Route>
                    <Route path="/host/brawl/final" element={<AuthRoute><BrawlFinal /></AuthRoute>}></Route>
                    <Route path="/host/dino/instructions" element={<AuthRoute><DinoInstruct /></AuthRoute>}></Route>
                    <Route path="/host/dino" element={<AuthRoute><DinoHost /></AuthRoute>}></Route>
                    <Route path="/host/dino/final" element={<AuthRoute><DinoFinal /></AuthRoute>}></Route>
                    <Route path="/host/defense" element={<AuthRoute><DefenseHost /></AuthRoute>}></Route>
                    <Route path="/host/defense/final" element={<AuthRoute><DefenseFinal /></AuthRoute>}></Route>
                    <Route path="/host/cafe" element={<AuthRoute><CafeHost /></AuthRoute>}></Route>
                    <Route path="/host/cafe/final" element={<AuthRoute><CafeFinal /></AuthRoute>}></Route>
                    <Route path="/host/factory" element={<AuthRoute><FactoryHost /></AuthRoute>}></Route>
                    <Route path="/host/factory/final" element={<AuthRoute><FactoryFinal /></AuthRoute>}></Route>
                    <Route path="/host/racing" element={<AuthRoute><RacingHost /></AuthRoute>}></Route>
                    <Route path="/host/racing/final" element={<AuthRoute><RacingFinal /></AuthRoute>}></Route>
                    <Route path="/host/teams" element={<AuthRoute><HostTeams /></AuthRoute>}></Route>
                    <Route path="/host/rush/instructions" element={<AuthRoute><RushInstruct /></AuthRoute>}></Route>
                    <Route path="/host/rush" element={<AuthRoute><RushHost /></AuthRoute>}></Route>
                    <Route path="/host/rush/final" element={<AuthRoute><RushFinal /></AuthRoute>}></Route>
                    <Route path="/host/battle-royale/instructions" element={<AuthRoute><RoyaleInstruct /></AuthRoute>}></Route>
                    <Route path="/host/battle-royale/match/preview" element={<AuthRoute><RoyalePreview /></AuthRoute>}></Route>
                    <Route path="/host/battle-royale/question" element={<AuthRoute><RoyaleQuestion /></AuthRoute>}></Route>
                    <Route path="/host/battle-royale/question/results" element={<AuthRoute><RoyaleQuestionResults /></AuthRoute>}></Route>
                    <Route path="/host/battle-royale/match/results" element={<AuthRoute><RoyaleMatchResults /></AuthRoute>}></Route>
                    <Route path="/host/battle-royale/final" element={<AuthRoute><RoyaleFinal /></AuthRoute>}></Route>
                    <Route path="/host/classic/get-ready" element={<AuthRoute><ClassicGetReady /></AuthRoute>}></Route>
                    <Route path="/host/classic/question" element={<AuthRoute><ClassicQuestion /></AuthRoute>}></Route>
                    <Route path="/host/classic/results" element={<AuthRoute><ClassicResults /></AuthRoute>}></Route>
                    <Route path="/host/classic/standings" element={<AuthRoute><ClassicStandings /></AuthRoute>}></Route>
                    <Route path="/host/classic/final" element={<AuthRoute><ClassicFinal /></AuthRoute>}></Route>
                </Route>
                <Route path="/*" element={<Navigate to="/"></Navigate>}></Route>
            </Routes>
        </ErrorBoundary>
    </AuthProvider>
}

export default App;
