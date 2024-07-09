function Login() {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [totpCode, setTotpCode] = React.useState('');
    const [status, setStatus] = React.useState('');
    const [showTotpField, setShowTotpField] = React.useState(false);
    const [showSuccess, setShowSuccess] = React.useState(false);
    const [user, setUser] = React.useState(null); // Store the user object
    const { setCurrentUser } = React.useContext(UserContext);

    const handleLogin = async (e) => {
        e.preventDefault();
        console.log("Attempting login with:", email, password);

        try {
            const response = await fetch('/account/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (response.ok && data.success) {
                console.log("Login successful:", data.user);
                if (data.requiresTotp) {
                    setShowTotpField(true);
                    setUser(data.user); // Store the user object for TOTP verification
                } else {
                    setCurrentUser(data.user);
                    setStatus('Login successful!');
                    setShowSuccess(true);
                }
            } else {
                console.error("Login failed:", data.message);
                setStatus(`Login failed: ${data.message}`);
            }
        } catch (error) {
            console.error("Login error:", error);
            setStatus('Login failed: Server error');
        }
    };

    const handleTotpVerify = async (e) => {
        e.preventDefault();
        console.log("Verifying TOTP code for:", email);

        try {
            const response = await fetch('/account/verify-totp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, totpCode })
            });
            const data = await response.json();
            if (response.ok && data.success) {
                console.log("TOTP verification successful:", data.user);
                setCurrentUser(data.user);
                setStatus('TOTP verification successful!');
                setShowSuccess(true);
            } else {
                console.error("TOTP verification failed:", data.message);
                setStatus(`TOTP verification failed: ${data.message}`);
            }
        } catch (error) {
            console.error("TOTP verification error:", error);
            setStatus('TOTP verification failed: Server error');
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
            /><br />
            <input
                type="password"
                className="form-control"
                id="password"
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.currentTarget.value)}
                required
            /><br />
            <button type="submit" className="btn btn-secondary" onClick={handleLogin}>Login</button>
            {status && <div className="status-message">{status}</div>}
        </>
    );

    const totpForm = (
        <>
            <input
                type="text"
                className="form-control"
                id="totpCode"
                placeholder="Enter Code From Authenticator App"
                value={totpCode}
                onChange={e => setTotpCode(e.currentTarget.value)}
                required
            /><br />
            <button type="submit" className="btn btn-secondary" onClick={handleTotpVerify}>Verify TOTP</button>
            {status && <div className="status-message">{status}</div>}
        </>
    );

    const successMessage = (
        <>
            <p>{status}</p>
            <button className="btn btn-secondary m-2" onClick={() => navigate('#/deposit/')}>Go to Deposit</button>
            <button className="btn btn-secondary m-2" onClick={() => navigate('#/withdraw/')}>Go to Withdraw</button>
            <button className="btn btn-secondary m-2" onClick={() => navigate('#/transfer/')}>Send Money</button>
            <button className="btn btn-secondary m-2" onClick={() => navigate('#/profile/')}>View Profile</button>
        </>
    );

    return (
        <Card
            bgcolor="primary"
            header="Login"
            body={!showSuccess ? (!showTotpField ? loginForm : totpForm) : successMessage}
        />
    );
}
