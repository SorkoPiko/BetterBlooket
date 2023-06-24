import "./form.css";

function Register() {
    return (<>
        <div id="header">Sign Up</div>
        <div className="input"><input placeholder="Username" maxLength={15}></input></div>
        <div className="input"><input type="email" placeholder="Email"></input></div>
        <div className="input"><input type="password" placeholder="Password"></input></div>
        <div className="input"><input type="password" placeholder="Confirm Password"></input></div>
        <div id="agreement">
            <input type="checkbox"></input>
            <div>I am at least 13 years old (or at least 16 outside of the U.S.) and I agree to the <a href="https://www.blooket.com/privacy" target="_blank">Privacy Policy</a> & <a href="https://www.blooket.com/terms" target="_blank">Terms of Service</a></div>
        </div>
        <input type="submit" id="submit" value="Sign Up"></input>
    </>);
}

export default Register;