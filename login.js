function Login() {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [status, setStatus] = React.useState('');
    const [showSuccess, setShowSuccess] = React.useState(false); // New state for showing login success message
    const { users, setCurrentUser, loginUser } = React.useContext(UserContext);

    const handleLogin = (e) => {
        e.preventDefault();
        const user = users.find(user => user.email === email && user.password === password);
        if (user) {
            setCurrentUser(user); // Update the current user in the context
            loginUser(user); // Presuming loginUser is a function in your context to handle user login
            setStatus('Login successful');
            setShowSuccess(true);

        } else {
            setStatus('Login failed: Incorrect email or password');
            setTimeout(() => setStatus(''), 3000); // Clear status after some time
        }
    };

    const navigate = (path) => {
        window.location.hash = path;
    }

    const loginForm = (
        <>
            <input 
                type="email" 
                className="form-control" 
                id="email" 
                placeholder="Enter email" 
                value={email} 
                onChange={e => setEmail(e.currentTarget.value)} 
                required
            /><br/>
            <input 
                type="password" 
                className="form-control" 
                id="password" 
                placeholder="Enter password" 
                value={password} 
                onChange={e => setPassword(e.currentTarget.value)}
                required
            /><br/>
            <button type="submit" className="btn btn-light" onClick={handleLogin}>Login</button>
        </>
    );

    const successMessage = (
        <>
            <p>{status}</p>
            <button className="btn btn-light m-2" onClick={() => navigate('#/deposit/')}>Go to Deposit</button>
            <button className="btn btn-light m-2" onClick={() => navigate('#/withdraw/')}>Go to Withdraw</button>
        </>
    );

    return (
        <Card
            bgcolor="primary"
            header="Login"
            body={!showSuccess ? loginForm : successMessage}
        />
    );
}




  