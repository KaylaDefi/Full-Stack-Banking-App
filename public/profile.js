function Profile() {
    const { currentUser } = React.useContext(UserContext);
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
              setAccounts(data.accounts);
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
                  <div key={account.accountNumber}>
                    <h4>{account.type} Account</h4>
                    <p>Balance: ${account.balance.toFixed(2)}</p>
                    <p>Account Number: {account.accountNumber}</p>
                  </div>
                ))
              ) : (
                <p>No accounts found.</p>
              )}
            </>
          ) : (
            <div>Please log in to view and edit your profile.</div>
          )
        }
      />
    );
  }
  