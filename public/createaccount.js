function CreateAccount() {
  const [show, setShow] = React.useState(true);
  const [status, setStatus] = React.useState('');
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isFormValid, setIsFormValid] = React.useState(true);

  function validate(field, label) {
      if (!field) {
          setStatus(`Error: ${label} is required.`);
          setTimeout(() => setStatus(''), 3000);
          return false;
      }
      if (label === 'Password' && field.length < 8) {
          setStatus('Error: Password must be at least 8 characters long');
          setTimeout(() => setStatus(''), 3000);
          setIsFormValid(false);
          return false;
      }
      return true;
  }

  async function handleCreate() {
      let isValid = true;
      isValid = validate(name, 'Name') && isValid;
      isValid = validate(email, 'Email') && isValid;
      isValid = validate(password, 'Password') && isValid;

      if (!isValid) {
          setIsFormValid(false);
          return;
      } 

      const url = `/account/create`;
      const payload = { name, email, password };

      try {
          const response = await fetch(url, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(payload)
          });
          const data = await response.json();
          console.log(data);
          if (data.success) {
              setShow(false);
          } else {
              setStatus(data.message);
          }
      } catch (error) {
          setStatus('Failed to create account');
          console.error('Error:', error);
      }
  }

  return (
      <Card
          bgcolor="primary"
          header="Create Account"
          status={status}
          body={show ? (
              <>
                  Name<br/>
                  <input type="input" className="form-control" placeholder="Enter name" value={name} onChange={e => { setName(e.currentTarget.value); setIsFormValid(true); }} /><br/>
                  Email address<br/>
                  <input type="input" className="form-control" placeholder="Enter email" value={email} onChange={e => { setEmail(e.currentTarget.value); setIsFormValid(true); }} /><br/>
                  Password<br/>
                  <input type="password" className="form-control" placeholder="Enter password" value={password} onChange={e => { setPassword(e.currentTarget.value); setIsFormValid(true); }} /><br/>
                  <button type="submit" className="btn btn-light" onClick={handleCreate} disabled={!isFormValid}>Create Account</button>
              </>
          ) : (
              <>
                  <h5>Success: Account Created!</h5>
                  <button type="button" className="btn btn-light" onClick={() => setShow(true)}>Add another account</button>
              </>
          )}
      />
  )
}
