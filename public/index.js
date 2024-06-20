function Spa() {
  const [users, setUsers] = React.useState([]);
  const [currentUser, setCurrentUser] = React.useState(null);

  React.useEffect(() => {
    async function loadUsers() {
      try {
        const response = await fetch('/account/all');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Failed to load users:', error);
      }
    }
    loadUsers();
  }, []);

  const loginUser = async (email, password) => {
    try {
      console.log("Login attempt for:", email, password);
      const response = await fetch('/account/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok) {
        console.log("Login successful:", data.user);
        setCurrentUser(data.user);
        console.log("Current user set to:", data.user);
      } else {
        console.error("Login failed:", data.message);
        alert(data.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert('An error occurred during login. Please try again.');
    }
  };  

  const logoutUser = () => {
    setCurrentUser(null);
    window.location.hash = '#/';
  };

  const handleAccountUpdate = async (email, amount) => {
    try {
      const response = await fetch('/account/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, amount })
      });
      const data = await response.json();
      if (data.success) {
        console.log('Account updated successfully:', data.response);
        // Optionally refresh user data or update state here
      } else {
        console.error('Account update failed:', data.message);
      }
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const handleDeposit = async (email, amount) => {
    try {
        const response = await fetch('/account/deposit', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, amount })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to deposit');
        }

        const data = await response.json();
        return data.updatedUser;
    } catch (err) {
        console.error('Error making deposit:', err);
        throw err;
    }
};

const handleWithdraw = async (email, amount) => {
  try {
      const response = await fetch('/account/withdraw', {
          method: 'PATCH',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, amount })
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to withdraw');
      }

      const data = await response.json();
      return data.updatedUser;
  } catch (err) {
      console.error('Error making withdraw:', err);
      throw err;
  }
};

React.useEffect(() => {
  console.log('Current User:', currentUser);
}, [currentUser]);

return (
  <HashRouter>
    <UserContext.Provider value={{ users, setUsers, currentUser, setCurrentUser, loginUser, logoutUser, handleAccountUpdate, handleDeposit, handleWithdraw }}>
      <NavBar />
      <div className="container" style={{ padding: "20px" }}>
        <Route path="/" exact component={Home} />
        <Route path="/CreateAccount/" component={CreateAccount} />
        <Route path="/login/" component={Login} />
        <Route path="/deposit/" component={Deposit} />
        <Route path="/withdraw/" component={Withdraw} />
        <Route path="/alldata/" component={AllData} />
      </div>
    </UserContext.Provider>
  </HashRouter>
);
}

ReactDOM.render(
  <Spa />,
  document.getElementById('root')
);


  



  