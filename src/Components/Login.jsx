import React from "react";

const Login = (props) => {
    return (
        <div className="login-container">
            <h1 className="welcome-message">Welcome to Decentralized Voting Application!</h1>
    
<div>
            <img src="/voting.webp" alt="Footer" className="footer-image" />
           <button className="login-button" onClick = {props.connectWallet}>Login Metamask</button>
</div>


        </div>

    )
}

export default Login;

