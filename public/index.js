function Spa() {
  const [users, setUsers] = React.useState([]);
  const [currentUser, setCurrentUser] = React.useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

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
      const response = await fetch('/account/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (data.success) {
        setCurrentUser(data.user);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        console.log("User logged in:", data.user);
      } else {
        console.error("Login failed:", data.message);
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const logoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
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
        console.log('Account updated successfully:', data);
        // Optionally refresh user data or update state here
      } else {
        console.error('Account update failed:', data.message);
      }
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  return (
    <HashRouter>
      <NavBar/>
      <UserContext.Provider value={{ users, setUsers, currentUser, setCurrentUser, loginUser, logoutUser, handleAccountUpdate }}>
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

  