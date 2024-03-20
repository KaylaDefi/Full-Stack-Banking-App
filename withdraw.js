function Withdraw() {
  const [withdraw, setWithdraw] = React.useState('');
  const [status, setStatus] = React.useState('');
  const { currentUser, updateUserBalance, logoutUser } = React.useContext(UserContext); // Now including logoutUser

  function handleWithdraw() {
      let amount = parseFloat(withdraw);
      if (isNaN(amount)) {
          setStatus('Error: Withdrawal must be a number');
      } else if (amount <= 0) {
          setStatus('Error: Withdrawal must be positive');
      } else if (currentUser && amount > currentUser.balance) {
          setStatus('Error: Insufficient funds for this withdrawal');
      } else if (currentUser) {
          updateUserBalance(currentUser.email, -amount);
          setStatus('Success: Withdrawal completed');
          setWithdraw('');
      } else {
          setStatus('Error: No user is currently logged in.');
      }
      setTimeout(() => setStatus(''), 3000);
  }

  function handleGoToLogin() {
    window.location.hash = '#/login/';
}

// If there's no currentUser, show the button to go to login
if (!currentUser) {
    return (
        <Card
            bgcolor="primary"
            header="Withdraw"
            status="Please login to withdraw funds."
            body={(
                <button type="button" className="btn btn-light" onClick={handleGoToLogin}>
                    Go to Login
                </button>
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
                  <h3>Your balance is ${currentUser ? currentUser.balance.toFixed(2) : '0.00'}</h3>
                  Withdrawal Amount<br/>
                  <input type="input" 
                         className="form-control" 
                         id="withdraw" 
                         placeholder="Enter amount" 
                         value={withdraw} 
                         onChange={e => setWithdraw(e.currentTarget.value)} 
                  /><br/>
                  <button type="submit" 
                          className="btn btn-light mb-2" 
                          onClick={handleWithdraw} 
                          disabled={!withdraw}>Withdraw</button>
                  {status && <div className="status-message">{status}</div>}
                  <br/> 
                  {currentUser && (
                      <button className="btn btn-warning btn-sm" 
                          onClick={logoutUser} style={{ marginTop: '40px' }}>
                          Logout
                      </button>
                  )}
              </>
          )}
      />
  );
}


