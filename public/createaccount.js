function CreateAccount() {
    const [show, setShow] = React.useState(true);
    const [status, setStatus] = React.useState('');
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [isFormValid, setIsFormValid] = React.useState(true);
    const [accountCreated, setAccountCreated] = React.useState(false);
    const { setUsers } = React.useContext(UserContext);
  
    function validate(field, label) {
      if (!field) {
        setStatus(`Error: ${label} is required.`);
        alert(`Error: ${label} is required.`);
        setTimeout(() => setStatus(''), 3000);
        return false;
      }
      if (label === 'Password' && field.length < 8) {
        setStatus('Error: Password must be at least 8 characters long');
        alert('Error: Password must be at least 8 characters long'); // Show an alert for password length
        setTimeout(() => setStatus(''), 3000);
        setIsFormValid(false);
        return false;
      }
      return true;
    }
  
    async function handleCreate() {
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
  
        try {
          const response = await fetch('/account/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser)
          });
          if (response.ok) {
            const data = await response.json();
            setUsers(prevUsers => [...prevUsers, data]);
            setAccountCreated(true);
            setShow(false);
            console.log('Account successfully created');
          } else {
            const errorData = await response.json();
            setStatus(`Error: ${errorData.message}`);
            alert(`Error: ${errorData.message}`);
            setTimeout(() => setStatus(''), 3000);
          }
        } catch (error) {
          setStatus('Error: Unable to create account. Please try again later.');
          alert('Error: Unable to create account. Please try again later.');
          setTimeout(() => setStatus(''), 3000);
        }
      }
    }
  
    async function handleAccountTypeSelection(type) {
      try {
        const response = await fetch('/account/addtype', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, type })
        });
        if (response.ok) {
          const data = await response.json();
          setStatus(`Success: ${type} Account Created!`);
          setTimeout(() => {
            window.location.hash = '#/login'; // Redirect user to login after account type creation
          }, 2000);
        } else {
          const errorData = await response.json();
          setStatus(`Error: ${errorData.message}`);
          setTimeout(() => setStatus(''), 3000);
        }
      } catch (error) {
        setStatus('Error: Unable to create account type. Please try again later.');
        setTimeout(() => setStatus(''), 3000);
      }
    }
  
    function clearForm() {
      setName('');
      setEmail('');
      setPassword('');
      setShow(true);
      setAccountCreated(false);
    }
  
    return (
      <Card
        bgcolor="primary"
        header="Create Account"
        status={status}
        body={show ? (
          <>
            Name<br />
            <input type="input" className="form-control" id="name" placeholder="Enter name" value={name} onChange={e => { setName(e.currentTarget.value); setIsFormValid(true); }} /><br />
            Email address<br />
            <input type="input" className="form-control" id="email" placeholder="Enter email" value={email} onChange={e => { setEmail(e.currentTarget.value); setIsFormValid(true); }} /><br />
            Password<br />
            <input type="password" className="form-control" id="password" placeholder="Enter password" value={password} onChange={e => { setPassword(e.currentTarget.value); setIsFormValid(true); }} /><br />
            <button type="submit" className="btn btn-light" onClick={handleCreate} disabled={!isFormValid}>Create Account</button>
          </>
        ) : accountCreated ? (
          <>
            <h5>Success: Account Created!</h5>
            <p>Select account type:</p>
            <button className="btn btn-primary" onClick={() => handleAccountTypeSelection('Checking')}>Checking Account</button>
            <button className="btn btn-secondary" onClick={() => handleAccountTypeSelection('Savings')}>Savings Account</button>
          </>
        ) : null}
      />
    );
  }
  
  