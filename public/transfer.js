function Transfer() {
    const { currentUser, setCurrentUser } = React.useContext(UserContext);
    const [fromAccountType, setFromAccountType] = React.useState('Checking');
    const [toAccountNumber, setToAccountNumber] = React.useState('');
    const [amount, setAmount] = React.useState(0);
    const [status, setStatus] = React.useState('');

    const handleTransfer = async () => {
        try {
            const response = await fetch('/account/transfer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fromEmail: currentUser.email, fromAccountType, toAccountNumber, amount })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    const updatedUserResponse = await fetch(`/account/findOne/${currentUser.email}`);
                    const updatedUser = await updatedUserResponse.json();
                    setCurrentUser(updatedUser);
                    setStatus('Transfer successful');
                } else {
                    setStatus(`Transfer failed: ${data.message}`);
                }
            } else {
                const errorData = await response.json();
                setStatus(`Transfer failed: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Transfer error:', error);
            setStatus('Transfer failed: Server error');
        }
    };

    return (
        <Card
            bgcolor="primary"
            header="Transfer"
            status={status}
            body={
                <>
                    <label>From Account Type</label>
                    <select className="form-control" value={fromAccountType} onChange={e => setFromAccountType(e.currentTarget.value)}>
                        <option value="Checking">Checking</option>
                        <option value="Savings">Savings</option>
                    </select>
                    <label>To Account Number</label>
                    <input type="text" className="form-control" value={toAccountNumber} onChange={e => setToAccountNumber(e.currentTarget.value)} />
                    <label>Amount</label>
                    <input type="number" className="form-control" value={amount} onChange={e => setAmount(parseFloat(e.currentTarget.value))} />
                    <button className="btn btn-primary" onClick={handleTransfer}>Transfer</button>
                </>
            }
        />
    );
}
