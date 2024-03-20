function AllData() {
    const ctx = React.useContext(UserContext);
  
    return (
      <div className="container">
        <h5>All Data in Store</h5>
        <div className="row">
          {ctx.users.map((user, index) => (
            <div className="col-sm-12 col-md-6 col-lg-4 mb-3" key={index}>
              <div className="card bg-primary text-white">
                <div className="card-header">
                  User {index + 1}
                </div>
                <div className="card-body">
                  <h5 className="card-title">{user.name}</h5>
                  <p className="card-text">Email: {user.email}</p>
                  <p className="card-text">Password: {user.password}</p>
                  <p className="card-text">Balance: ${user.balance}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  