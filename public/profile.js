function Profile() {
    const { currentUser, setCurrentUser, users, setUsers } = React.useContext(UserContext);
    const [accounts, setAccounts] = React.useState([]);
    const [status, setStatus] = React.useState('');
    const [qrCodeDataUrl, setQrCodeDataUrl] = React.useState('');

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

    const handleEnable2FA = async () => {
        try {
            const response = await fetch('/account/enable-2fa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: currentUser.email })
            });
            const data = await response.json();
            if (response.ok) {
                setStatus('2FA enabled successfully!');
                // Display QR code for 2FA
                setQrCodeDataUrl(data.qrCodeDataUrl);
            } else {
                setStatus(`Failed to enable 2FA: ${data.message}`);
            }
        } catch (err) {
            setStatus('Failed to enable 2FA: Server error');
            console.error('Failed to enable 2FA:', err);
        }
    };
    

    const handleDisable2FA = async () => {
        try {
            const response = await fetch('/account/disable-2fa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: currentUser.email })
            });
            if (response.ok) {
                setCurrentUser(prevUser => ({ ...prevUser, twoFactorEnabled: false }));
                setStatus('2FA disabled successfully!');
            } else {
                setStatus('Failed to disable 2FA');
            }
        } catch (error) {
            console.error('Disable 2FA error:', error);
            setStatus('Failed to disable 2FA');
        }
    };

    return (
        <Card
            bgcolor="primary"
            header="Profile"
            status={status}
            body={
                currentUser ? (
                    <div className="profile-card">
                        <div>Name: {currentUser.name}</div>
                        <div>Email: {currentUser.email}</div>
                        <hr />
                        <h3 style={{ fontWeight: 'bold' }}>Accounts</h3>
                        {accounts.length > 0 ? (
                            accounts.map(account => (
                                <div key={account._id}>
                                    <hr />
                                    <h4 style={{ fontWeight: 'bold' }}>{account.type} Account</h4>
                                    <p>Balance: ${account.balance.toFixed(2)}</p>
                                    <p>Account Number: {account.accountNumber}</p>
                                    <hr />
                                </div>
                            ))
                        ) : (
                            <p>No accounts found.</p>
                        )}
                        {!hasAccountType('Checking') && (
                            <button className="btn btn-secondary" onClick={() => handleAccountTypeSelection('Checking')}>
                                Create Checking Account
                            </button>
                        )}
                        {!hasAccountType('Savings') && (
                            <button className="btn btn-secondary" onClick={() => handleAccountTypeSelection('Savings')}>
                                Create Savings Account
                            </button>
                        )}
                        <br />
                        <hr />
                        <TransactionHistory />
                        {currentUser.twoFactorEnabled ? (
                            <button className="btn btn-danger" onClick={handleDisable2FA}>Disable 2FA</button>
                        ) : (
                            <>
                                <button className="btn btn-secondary" onClick={handleEnable2FA}>Enable 2FA</button>
                                {qrCodeDataUrl && (
                                    <>
                                        <h5 style={{ textAlign: 'center' }}>Scan the QR code with your authenticator app:</h5>
                                        <img src={qrCodeDataUrl} alt="QR Code" style={{ display: 'block', margin: '0 auto' }} />
                                    </>
                                )}
                            </>
                        )}
                    </div>
                ) : (
                    <div>Please log in to view and edit your profile.</div>
                )
            }
        />
    );
}

