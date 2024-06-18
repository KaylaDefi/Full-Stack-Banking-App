function Withdraw() {
  const [withdraw, setWithdraw] = React.useState('');
  const [status, setStatus] = React.useState('');
  const { currentUser, setCurrentUser, handleWithdraw, logoutUser } = React.useContext(UserContext);

  // Log the currentUser as soon as the component function is called/rendered
  console.log("Current user in Withdraw component:", currentUser);

  async function handleWithdrawClick() {
      let amount = parseFloat(withdraw);
      if (isNaN(amount)) {
          setStatus('Error: Withdraw must be a number');
      } else if (amount <= 0) {
          setStatus('Error: Withdraw must be positive');
      } else if (!currentUser) {
          setStatus('Error: No user is currently logged in.');
      } else if (amount > currentUser.balance) {
          setStatus('Error: Insufficient balance');
      } else {
          try {
              const updatedUser = await handleWithdraw(currentUser.email, amount);
              if (updatedUser) {
                  setStatus('Success: Withdraw completed');
                  setCurrentUser(updatedUser);
                  setWithdraw(''); // Clear the withdraw input field after successful withdraw
              } else {
                  setStatus('Error: Withdraw failed');
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
                  <h3>Your balance is ${currentUser ? currentUser.balance.toFixed(2) : '0.00'}</h3>
                  Withdraw Amount<br/>
                  <input type="input" 
                      className="form-control" 
                      id="withdraw" 
                      placeholder="Enter amount" 
                      value={withdraw} 
                      onChange={e => setWithdraw(e.currentTarget.value)} 
                  /><br/>
                  <button type="submit" 
                      className="btn btn-light mb-2" 
                      onClick={handleWithdrawClick} 
                      disabled={!withdraw}>Withdraw</button>
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