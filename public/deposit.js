function Deposit() {
    const [amount, setAmount] = React.useState('');
    const [status, setStatus] = React.useState('');
    const { currentUser, setCurrentUser } = React.useContext(UserContext);

    async function handleDeposit() {
        let numAmount = parseFloat(amount);
        if (isNaN(numAmount)) {
            setStatus('Error: Deposit must be a number');
        } else if (numAmount <= 0) {
            setStatus('Error: Deposit amount must be positive');
        } else if (!currentUser) {
            setStatus('Error: No user is currently logged in.');
        } else {
            try {
                const response = await fetch('/account/deposit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: currentUser.email, amount: numAmount })
                });
                const data = await response.json();
                if (response.ok) {
                    setStatus('Success: Deposit received');
                    setCurrentUser({ ...currentUser, balance: data.newBalance }); // Update current user balance
                    setAmount('');
                } else {
                    setStatus(data.message);
                }
            } catch (error) {
                setStatus('Error: Unable to process deposit');
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
                header="Deposit"
                status="Please login to make a deposit."
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
            bgcolor="warning"
            header="Deposit"
            body={(
                <>
                    <h3>Your balance is ${currentUser ? currentUser.balance.toFixed(2) : '0.00'}</h3>
                    Deposit Amount<br/>
                    <input type="number" 
                           className="form-control" 
                           id="deposit" 
                           placeholder="Enter amount" 
                           value={amount} 
                           onChange={e => setAmount(e.currentTarget.value)} 
                    /><br/>
                    <button type="submit" 
                            className="btn btn-light mb-2" 
                            onClick={handleDeposit} 
                            disabled={!amount}>Deposit</button>
                    {status && <div className="status-message">{status}</div>}
                </>
            )}
        />
    );
}

  
