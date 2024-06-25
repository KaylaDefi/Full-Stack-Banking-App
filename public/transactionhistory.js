function TransactionHistory() {
  const { currentUser } = React.useContext(UserContext);
  const [transactions, setTransactions] = React.useState([]);

  React.useEffect(() => {
      if (currentUser) {
          setTransactions(currentUser.transactions || []);
      }
  }, [currentUser]);

  return (
      <Card
          bgcolor="primary"
          header="Transaction History"
          body={
              transactions.length > 0 ? (
                  <ul className="list-group transaction-history">
                      {transactions.map((transaction, index) => (
                          <li key={index} className="list-group-item">
                              <div>Type: {transaction.type}</div>
                              <div>Amount: ${transaction.amount.toFixed(2)}</div>
                              <div>Currency: {transaction.currency}</div>
                              <div>Date: {new Date(transaction.date).toLocaleString()}</div>
                          </li>
                      ))}
                  </ul>
              ) : (
                  <div>No transactions found.</div>
              )
          }
      />
  );
}

  