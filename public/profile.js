function Profile() {
    const { currentUser, setCurrentUser, users, setUsers } = React.useContext(UserContext);
    const [accounts, setAccounts] = React.useState([]);
    const [status, setStatus] = React.useState('');
  
    React.useEffect(() => {
      async function fetchAccounts() {
        if (currentUser) {
          console.log('Fetching accounts for:', currentUser.email);
          try {
            const response = await fetch(`/account/findOne/${currentUser.email}`);
            const data = await response.json();
            console.log('Fetched accounts:', data);
            if (data) {
              setAccounts(data.accounts || []);
            } else {
              setStatus('Failed to fetch accounts');
            }
          } catch (error) {
            console.error('Fetch accounts error:', error);
            setStatus('Failed to fetch accounts: Server error');
          }
        } else {
          console.log('No current user');
        }
      }
  
      fetchAccounts();
    }, [currentUser]);
  
    const hasAccountType = (type) => {
      return accounts.some(acc => acc.type === type);
    };
  
    const handleAccountTypeSelection = async (type) => {
      try {
        const response = await fetch('/account/addtype', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: currentUser.email, type })
        });
        if (response.ok) {
          const data = await response.json();
          setUsers(prevUsers => prevUsers.map(user => user.email === currentUser.email ? data.user : user));
          setCurrentUser(data.user);
          setAccounts(data.user.accounts);
          setStatus(`Success: ${type} Account Created!`);
          setTimeout(() => setStatus(''), 3000);
        } else {
          const errorData = await response.json();
          setStatus(`Error: ${errorData.message}`);
          setTimeout(() => setStatus(''), 3000);
        }
      } catch (error) {
        setStatus('Error: Unable to create account. Please try again later.');
        setTimeout(() => setStatus(''), 3000);
      }
    };
  
    return (
      <Card
        bgcolor="primary"
        header="Profile"
        status={status}
        body={
          currentUser ? (
            <>
              <div>Email: {currentUser.email}</div>
              <h3>Accounts</h3>
              {accounts.length > 0 ? (
                accounts.map(account => (
                  <div key={account._id}>
                    <h4>{account.type} Account</h4>
                    <p>Balance: ${account.balance.toFixed(2)}</p>
                    <p>Account Number: {account.accountNumber}</p>
                  </div>
                ))
              ) : (
                <p>No accounts found.</p>
              )}
              {!hasAccountType('Checking') && (
                <button className="btn btn-primary" onClick={() => handleAccountTypeSelection('Checking')}>
                  Create Checking Account
                </button>
              )}
              {!hasAccountType('Savings') && (
                <button className="btn btn-secondary" onClick={() => handleAccountTypeSelection('Savings')}>
                  Create Savings Account
                </button>
              )}
              <TransactionHistory />
            </>
          ) : (
            <div>Please log in to view and edit your profile.</div>
          )
        }
      />
    );
  }
  