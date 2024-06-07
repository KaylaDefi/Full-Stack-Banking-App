function NavBar(){
  const NavLink = ReactRouterDOM.NavLink;

  return(
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
        </ul>
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
      `}
    </style>
    </>
  );
}
