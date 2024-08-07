function CreateAccount() {
  const [show, setShow] = React.useState(true);
  const [status, setStatus] = React.useState('');
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [accountType, setAccountType] = React.useState('Checking');
  const [isFormValid, setIsFormValid] = React.useState(true);
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
          alert('Error: Password must be at least 8 characters long');
          setTimeout(() => setStatus(''), 3000);
          setIsFormValid(false);
          return false;
      }
      return true;
  }

  async function handleCreate() {
      console.log(name, email, password);
      let isValid = true;

      isValid = validate(name, 'Name') && isValid;
      isValid = validate(email, 'Email') && isValid;
      isValid = validate(password, 'Password') && isValid;

      if (!isValid) {
          setIsFormValid(false);
          return;
      }

      const newUser = { name, email, password, accountType };

      try {
          const response = await fetch('/account/create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newUser)
          });
          if (response.ok) {
              const data = await response.json();
              setUsers(prevUsers => [...prevUsers, data.user]);
              setShow(false);
              setStatus('Account created successfully!');
          } else {
              const errorData = await response.json();
              setStatus(`Error: ${errorData.message}`);
              setTimeout(() => setStatus(''), 3000);
          }
      } catch (error) {
          setStatus('Error: Unable to create account. Please try again later.');
          setTimeout(() => setStatus(''), 3000);
      }
  }

  function goToLogin() {
      window.location.hash = '#/login';
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
                  Account Type<br />
                  <select className="form-control" value={accountType} onChange={e => setAccountType(e.currentTarget.value)}>
                      <option value="Checking">Checking</option>
                      <option value="Savings">Savings</option>
                  </select><br />
                  <button type="submit" className="btn btn-secondary" onClick={handleCreate} disabled={!isFormValid}>Create Account</button>
              </>
          ) : (
              <>
                  <button type="button" className="btn btn-secondary" onClick={goToLogin}>Go To Login</button>
              </>
          )}
      />
  );
}
