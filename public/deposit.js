function Deposit() {
    const [deposit, setDeposit] = React.useState('');
    const [accountType, setAccountType] = React.useState('Checking');
    const [status, setStatus] = React.useState('');
    const { currentUser, setCurrentUser, handleDeposit, logoutUser } = React.useContext(UserContext);
  
    console.log("Current user in Deposit component:", currentUser);
  
    const getBalance = () => {
      if (!currentUser || !currentUser.accounts) return 0;
      const account = currentUser.accounts.find(acc => acc.type === accountType);
      return account ? account.balance : 0;
    };
  
    const hasAccountType = (type) => {
      return currentUser && currentUser.accounts && currentUser.accounts.some(acc => acc.type === type);
    };
  
    async function handleDepositClick() {
      let amount = parseFloat(deposit);
      if (isNaN(amount)) {
        setStatus('Error: Deposit must be a number');
      } else if (amount <= 0) {
        setStatus('Error: Deposit must be positive');
      } else if (!currentUser) {
        setStatus('Error: No user is currently logged in.');
      } else {
        try {
          const response = await fetch('/account/deposit', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: currentUser.email, amount, accountType })
          });
  
          if (response.ok) {
            const data = await response.json();
            setStatus(`Success: Deposit received into ${accountType} account`);
            setCurrentUser(data.updatedUser);
            setDeposit(''); 
          } else {
            const errorData = await response.json();
            setStatus(`Error: ${errorData.message}`);
          }
        } catch (err) {
          console.error('Error making deposit:', err);
          setStatus('Error: Could not process deposit');
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
          header="Deposit"
          status="Please login to make a deposit."
          body={(
            <div>
              <button type="button" className="btn btn-secondary" onClick={handleGoToLogin}>
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
        header="Deposit"
        body={(
          <>
            <h3>Your {accountType} balance is ${getBalance().toFixed(2)}</h3>
            Deposit Amount<br />
            <input type="input"
              className="form-control"
              id="deposit"
              placeholder="Enter amount"
              value={deposit}
              onChange={e => setDeposit(e.currentTarget.value)}
            /><br />
            Account Type<br />
            <select className="form-control" value={accountType} onChange={e => setAccountType(e.currentTarget.value)}>
              <option value="Checking" disabled={!hasAccountType('Checking')}>Checking</option>
              <option value="Savings" disabled={!hasAccountType('Savings')}>Savings</option>
            </select><br />
            <button type="submit"
              className="btn btn-secondary mb-2"
              onClick={handleDepositClick}
              disabled={!deposit}>Deposit</button>
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