function Withdraw() {
    const [amount, setAmount] = React.useState('');
    const [status, setStatus] = React.useState('');
    const { currentUser, setCurrentUser } = React.useContext(UserContext);
  
    async function handleWithdraw() {
        let numAmount = parseFloat(amount);
        if (isNaN(numAmount)) {
            setStatus('Error: Withdrawal must be a number');
        } else if (numAmount <= 0) {
            setStatus('Error: Withdrawal amount must be positive');
        } else {
            try {
                const response = await fetch('/account/withdraw', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: currentUser.email, amount: numAmount })
                });
                const data = await response.json();
                if (response.ok) {
                    setStatus('Success: Withdrawal completed');
                    setCurrentUser({ ...currentUser, balance: data.newBalance });
                    setAmount('');
                } else {
                    setStatus(data.message);
                }
            } catch (error) {
                setStatus('Error: Unable to process withdrawal');
            }
        }
        setTimeout(() => setStatus(''), 3000);
    }
  
    function handleGoToLogin() {
        window.location.hash = '#/login/';
    }
  
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
            bgcolor="success"
            header="Withdraw"
            body={(
                <>
                    <h3>Your balance is ${currentUser.balance.toFixed(2)}</h3>
                    Withdrawal Amount<br/>
                    <input type="number" 
                           className="form-control" 
                           id="withdraw" 
                           placeholder="Enter amount" 
                           value={amount} 
                           onChange={e => setAmount(e.currentTarget.value)} 
                    /><br/>
                    <button type="submit" 
                            className="btn btn-light mb-2" 
                            onClick={handleWithdraw} 
                            disabled={!amount}>Withdraw</button>
                    {status && <div className="status-message">{status}</div>}
                </>
            )}
        />
    );
  }
  


