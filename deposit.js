function Deposit() {
    const [deposit, setDeposit] = React.useState('');
    const [status, setStatus] = React.useState('');
    const { currentUser, updateUserBalance, logoutUser } = React.useContext(UserContext); // Consuming UserContext

    // Log the currentUser as soon as the component function is called/rendered
    console.log("Current user in Deposit component:", currentUser);

    function handleDeposit() {
        let amount = parseFloat(deposit);
        if (isNaN(amount)) {
            setStatus('Error: Deposit must be a number');
        } else if (amount <= 0) {
            setStatus('Error: Deposit must be positive');
        } else if (!currentUser) {
            setStatus('Error: No user is currently logged in.');
        } else {
            // Use the updateUserBalance function from context to update the balance
            updateUserBalance(currentUser.email, amount);
            setStatus('Success: Deposit received');
            setDeposit(''); // Clear the deposit input field after successful deposit
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
                            onClick={handleDeposit} 
                            disabled={!deposit}>Deposit</button>
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

  
