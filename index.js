function Spa() {
  const [users, setUsers] = React.useState([{name:'abel', email:'abel@mit.edu', password:'secret', balance:100}]);
  const [currentUser, setCurrentUser] = React.useState(() => {
    // Retrieve user data from localStorage or sessionStorage
    const savedUser = localStorage.getItem('currentUser');
    console.log("Rehydrating currentUser from localStorage:", savedUser ? JSON.parse(savedUser) : null);
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const updateUserBalance = (email, amount) => {
    const updatedUsers = users.map(user => {
      if (user.email === email) {
        return { ...user, balance: user.balance + amount };
      }
      return user;
    });
    setUsers(updatedUsers);

    const updatedCurrentUser = updatedUsers.find(user => user.email === email);
    if (updatedCurrentUser) {
      setCurrentUser(updatedCurrentUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
    }
  };
  
  const loginUser = (email) => {
    const user = users.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      console.log("User logged in and set in context and localStorage:", user);
    } else {
      console.error("User not found");
    }
  };
  
  const logoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    // Also reset the hash to redirect to the home page or login page
    window.location.hash = '#/';
  };

    return (
      <HashRouter>
        <NavBar/>
        <UserContext.Provider value={{ users, setUsers, currentUser, setCurrentUser, updateUserBalance, loginUser, logoutUser, }}>
          <div className="container" style={{padding: "20px"}}>
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
    <Spa/>,
    document.getElementById('root')
  );
  