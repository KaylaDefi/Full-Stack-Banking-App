function Deposit() {
  const [deposit, setDeposit] = React.useState('');
  const [status, setStatus] = React.useState('');
  const { currentUser, setCurrentUser, handleDeposit, logoutUser } = React.useContext(UserContext);

  // Log the currentUser as soon as the component function is called/rendered
  console.log("Current user in Deposit component:", currentUser);

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
              const updatedUser = await handleDeposit(currentUser.email, amount);
              if (updatedUser) {
                  setStatus('Success: Deposit received');
                  setCurrentUser(updatedUser);
                  setDeposit(''); // Clear the deposit input field after successful deposit
              } else {
                  setStatus('Error: Deposit failed');
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
          header="Deposit"
          body={(
              <>
                  <h3>Your balance is ${currentUser ? currentUser.balance.toFixed(2) : '0.00'}</h3>
                  Deposit Amount<br/>
                  <input type="input" 
                      className="form-control" 
                      id="deposit" 
                      placeholder="Enter amount" 
                      value={deposit} 
                      onChange={e => setDeposit(e.currentTarget.value)} 
                  /><br/>
                  <button type="submit" 
                      className="btn btn-light mb-2" 
                      onClick={handleDepositClick} 
                      disabled={!deposit}>Deposit</button>
                  {status && <div className="status-message">{status}</div>}
                  <br/> 
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

  
  
  
