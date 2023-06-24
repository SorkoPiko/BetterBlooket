function Login() {
    return (<>
        <div id="header">Log In</div>
        <div className="input"><input placeholder="Username or Email"></input></div>
        <div className="input"><input type="password" placeholder="Password"></input></div>
        <input type="submit" id="submit" value="Log In"></input>
    </>);
}

export default Login;