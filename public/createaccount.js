function CreateAccount() {
  const [show, setShow] = React.useState(true);
  const [status, setStatus] = React.useState('');
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = React.useState(''); // New state for QR code
  const [isFormValid, setIsFormValid] = React.useState(true); // Ensure form validation
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
      let isValid = true; // Assume form is valid initially

      // Validate all fields first before deciding if form is valid
      isValid = validate(name, 'Name') && isValid;
      isValid = validate(email, 'Email') && isValid;
      isValid = validate(password, 'Password') && isValid;

      if (!isValid) {
          setIsFormValid(false); // Disable the submit button due to validation failure
          return;
      }

      const newUser = { name, email, password };

      try {
          const response = await fetch('/account/create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newUser)
          });
          if (response.ok) {
              const data = await response.json();
              setUsers(prevUsers => [...prevUsers, data.user]);
              setQrCodeDataUrl(data.qrCodeDataUrl); // Set QR code data URL
              setShow(false);
              setStatus('Account created successfully. Scan the QR code with your authenticator app.');
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
      setStatus('');
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
                  <button type="submit" className="btn btn-secondary" onClick={handleCreate} disabled={!isFormValid}>Create Account</button>
              </>
          ) : (
              qrCodeDataUrl ? (
                  <>
                      <h5>Success: Account Created!</h5>
                      <p>Scan the QR code with your authenticator app:</p>
                      <img src={qrCodeDataUrl} alt="QR Code" /><br />
                      <p>After scanning the QR code, select your account type:</p>
                      <button className="btn btn-primary" onClick={() => handleAccountTypeSelection('Checking')}>Checking Account</button>
                      <button className="btn btn-primary" onClick={() => handleAccountTypeSelection('Savings')}>Savings Account</button>
                  </>
              ) : (
                  <>
                      <h5>Success: Account Created!</h5>
                      <p>Select account type:</p>
                      <button className="btn btn-primary" onClick={() => handleAccountTypeSelection('Checking')}>Checking Account</button>
                      <button className="btn btn-primary" onClick={() => handleAccountTypeSelection('Savings')}>Savings Account</button>
                  </>
              )
          )}
      />
  );
}
