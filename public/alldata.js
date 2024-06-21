function AllData() {
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/account/all');
        const data = await response.json();
        setUsers(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <h5>All Data in Store</h5>
      <div className="row">
        {users.map((user, index) => (
          <div className="col-sm-12 col-md-6 col-lg-4 mb-3" key={index}>
            <div className="card bg-primary text-white">
              <div className="card-header">
                User {index + 1}
              </div>
              <div className="card-body">
                <h5 className="card-title">{user.name}</h5>
                <p className="card-text">Email: {user.email}</p>
                <p className="card-text">Password: {user.password}</p>
                {user.accounts && user.accounts.length > 0 ? (
                  <div>
                    <h6>Accounts:</h6>
                    {user.accounts.map((account, accIndex) => (
                      <div key={accIndex}>
                        <p>Type: {account.type}</p>
                        <p>Balance: ${account.balance.toFixed(2)}</p>
                        <p>Account Number: {account.accountNumber}</p>
                        <hr />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No accounts found.</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
