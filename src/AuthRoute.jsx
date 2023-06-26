import { useAuth } from "./context/AuthContext";
import { Navigate } from "react-router-dom";

function AuthRoute({ children }) {
    const { userData } = useAuth();
    return userData ? children : <Navigate to="/login"></Navigate>
}

export default AuthRoute;