function Login() {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [status, setStatus] = React.useState('');
    const [showSuccess, setShowSuccess] = React.useState(false);
    const { setCurrentUser, loginUser } = React.useContext(UserContext);
  
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
          setCurrentUser(data.user);
          await loginUser(email, password); 
          setStatus('Login successful');
          setShowSuccess(true);
        } else {
          console.error("Login failed:", data.message);
          setStatus(`Login failed: ${data.message}`);
          setTimeout(() => setStatus(''), 3000);
        }
      } catch (error) {
        console.error("Login error:", error);
        setStatus('Login failed: Server error');
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
        <button type="submit" className="btn btn-light" onClick={handleLogin}>Login</button>
        {status && <div className="status-message">{status}</div>}
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
  