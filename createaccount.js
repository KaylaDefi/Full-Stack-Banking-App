function CreateAccount(){
    const [show, setShow]         = React.useState(true);
    const [status, setStatus]     = React.useState('');
    const [name, setName]         = React.useState('');
    const [email, setEmail]       = React.useState('');
    const [password, setPassword] = React.useState('');
    const [isFormValid, setIsFormValid] = React.useState(true);
    const { users, setUsers } = React.useContext(UserContext);
  
    function validate(field, label){
        if (!field) {
          setStatus(`Error: ${label} is required.`);
          alert(`Error: ${label} is required.`);
          setTimeout(() => setStatus(''),3000);
          return false;
        }
        if (label === 'Password' && field.length < 8) {
          setStatus('Error: Password must be at least 8 characters long');
          alert('Error: Password must be at least 8 characters long'); // Show an alert for password length
          setTimeout(() => setStatus(''),3000);
          setIsFormValid(false);
          return false;
        }
        return true;
    }
  
    function handleCreate() {
      console.log(name, email, password);
      let isValid = true; // Assume form is valid initially
  
      // Validate all fields first before deciding if form is valid
      isValid = validate(name, 'Name') && isValid;
      isValid = validate(email, 'Email') && isValid;
      isValid = validate(password, 'Password') && isValid;
  
      if (!isValid) {
          setIsFormValid(false); // Disable the submit button due to validation failure
          return;
      } else {
          setIsFormValid(true); // Ensure the button is enabled if form is valid
          const newUser = { name, email, password, balance: 100 };
          setUsers([...users, newUser]);
          setShow(false);
      }
  }
   
  
    function clearForm(){
      setName('');
      setEmail('');
      setPassword('');
      setShow(true);
    }

    function navigateToLogin() {
      window.location.hash = '#/login/';
    }
  
    return (
      <Card
        bgcolor="primary"
        header="Create Account"
        status={status}
        body={show ? (  
                <>
                Name<br/>
                <input type="input" className="form-control" id="name" placeholder="Enter name" value={name} onChange={e => {setName(e.currentTarget.value); setIsFormValid(true);}} /><br/>
                Email address<br/>
                <input type="input" className="form-control" id="email" placeholder="Enter email" value={email} onChange={e => {setEmail(e.currentTarget.value); setIsFormValid(true);}} /><br/>
                Password<br/>
                <input type="password" className="form-control" id="password" placeholder="Enter password" value={password} onChange={e => {setPassword(e.currentTarget.value); setIsFormValid(true);}} /><br/>
                <button type="submit" className="btn btn-light" onClick={handleCreate} disabled={!isFormValid}>Create Account</button>
                </>
              ):(
                <>
                <h5>Success: Account Created!</h5>
                <button type="button" className="btn btn-light mb-2" onClick={navigateToLogin}>Login</button>
                <br/>
                <button type="button" className="btn btn-light" onClick={clearForm}>Add another account</button>
                </>
              )}
      />
    )
  }