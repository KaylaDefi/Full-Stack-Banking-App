function NavBar() {
  const NavLink = ReactRouterDOM.NavLink;
  const context = React.useContext(UserContext);
  const currentUser = context ? context.currentUser : null;
  const logoutUser = context ? context.logoutUser : null;
  const [darkMode, setDarkMode] = React.useState(false);

  console.log('NavBar Current User:', currentUser);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <a className="navbar-brand" href="#">BadBank</a>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <NavLink className="nav-link" to="/" exact activeClassName="active" title="Go to homepage.">Home</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/CreateAccount/" activeClassName="active" title="Start banking with us by creating a new account.">Create Account</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/login/" activeClassName="active" title="Login to your account to manage your finances.">Login</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/deposit/" activeClassName="active" title="Deposit money into your account.">Deposit</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/withdraw/" activeClassName="active" title="Withdraw money from your account.">Withdraw</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/alldata/" activeClassName="active" title="View all user inputs (bank staff only).">AllData</NavLink>
            </li>
            {currentUser && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/profile/" activeClassName="active" title="View and update your profile.">Profile</NavLink>
              </li>
            )}
          </ul>
          <div className="ml-auto d-flex align-items-center">
            {currentUser && (
              <>
                <span className="navbar-text mr-3">
                  Welcome, {currentUser.name}
                </span>
                <button className="btn btn-outline-danger" onClick={logoutUser}>Logout</button>
              </>
            )}
            <button className="btn btn-secondary ml-3" onClick={toggleDarkMode}>
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>
      </nav>
      <style>
        {`
          .nav-link:hover {
            font-weight: bold;
            text-decoration: underline;
          }
          .active {
            color: #007bff !important;
            background-color: #ddd;
          }
          .navbar-text {
            margin-right: 15px;
          }
        `}
      </style>
    </>
  );
}
