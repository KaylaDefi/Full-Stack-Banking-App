function Login() {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [status, setStatus] = React.useState('');
    const [showSuccess, setShowSuccess] = React.useState(false);
    const { setCurrentUser } = React.useContext(UserContext);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/account/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (response.ok && data.user) {
                setCurrentUser(data.user); // Set current user in context
                setStatus('Login successful');
                setShowSuccess(true);
            } else {
                setStatus(data.message || 'Login failed: Incorrect email or password');
                setTimeout(() => setStatus(''), 3000); // Clear status after some time
            }
        } catch (error) {
            console.error('Login failed:', error);
            setStatus('Login failed: Unable to connect');
            setTimeout(() => setStatus(''), 3000);
        }
    };

    const navigate = (path) => {
        window.location.hash = path;
    };

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
            <p>{status}</p>
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





  