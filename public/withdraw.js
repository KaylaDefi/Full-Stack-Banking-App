function Withdraw() {
    const [withdraw, setWithdraw] = React.useState('');
    const [accountType, setAccountType] = React.useState('Checking');
    const [status, setStatus] = React.useState('');
    const { currentUser, setCurrentUser, handleWithdraw, logoutUser } = React.useContext(UserContext);
  
    // Log the currentUser as soon as the component function is called/rendered
    console.log("Current user in Withdraw component:", currentUser);
  
    const getBalance = () => {
      if (!currentUser || !currentUser.accounts) return 0;
      const account = currentUser.accounts.find(acc => acc.type === accountType);
      return account ? account.balance : 0;
    };
  
    const hasAccountType = (type) => {
      return currentUser && currentUser.accounts && currentUser.accounts.some(acc => acc.type === type);
    };
  
    async function handleWithdrawClick() {
      let amount = parseFloat(withdraw);
      if (isNaN(amount)) {
        setStatus('Error: Withdraw must be a number');
      } else if (amount <= 0) {
        setStatus('Error: Withdraw must be positive');
      } else if (!currentUser) {
        setStatus('Error: No user is currently logged in.');
      } else if (amount > getBalance()) {
        setStatus('Error: Insufficient balance');
      } else {
        try {
          const response = await fetch('/account/withdraw', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: currentUser.email, amount, accountType })
          });
  
          if (response.ok) {
            const data = await response.json();
            setStatus(`Success: Withdraw from ${accountType} account completed`);
            setCurrentUser(data.updatedUser);
            setWithdraw(''); // Clear the withdraw input field after successful withdraw
          } else {
            const errorData = await response.json();
            setStatus(`Error: ${errorData.message}`);
          }
        } catch (err) {
          console.error('Error making withdraw:', err);
          setStatus('Error: Could not process withdraw');
        }
      }
      setTimeout(() => setStatus(''), 3000);
    }
  
    function handleGoToLogin() {
      console.log("Redirecting to login page");
      window.location.hash = '#/login/';
    }
  
    if (!currentUser) {
      console.log("No current user, should redirect to login");
      return (
        <Card
          bgcolor="primary"
          header="Withdraw"
          status="Please login to make a withdraw."
          body={(
            <div>
              <button type="button" className="btn btn-light" onClick={handleGoToLogin}>
                Go to Login
              </button>
            </div>
          )}
        />
      );
    }
  
    return (
      <Card
        bgcolor="primary"
        header="Withdraw"
        body={(
          <>
            <h3>Your {accountType} balance is ${getBalance().toFixed(2)}</h3>
            Withdraw Amount<br />
            <input type="input"
              className="form-control"
              id="withdraw"
              placeholder="Enter amount"
              value={withdraw}
              onChange={e => setWithdraw(e.currentTarget.value)}
            /><br />
            Account Type<br />
            <select className="form-control" value={accountType} onChange={e => setAccountType(e.currentTarget.value)}>
              <option value="Checking" disabled={!hasAccountType('Checking')}>Checking</option>
              <option value="Savings" disabled={!hasAccountType('Savings')}>Savings</option>
            </select><br />
            <button type="submit"
              className="btn btn-light mb-2"
              onClick={handleWithdrawClick}
              disabled={!withdraw}>Withdraw</button>
            {status && <div className="status-message">{status}</div>}
            <br />
            {currentUser && (
              <button className="btn btn-warning btn-sm"
                onClick={() => {
                  logoutUser();
                  handleGoToLogin();
                }} style={{ marginTop: '40px' }}>
                Logout
              </button>
            )}
          </>
        )}
      />
    );
  }
  