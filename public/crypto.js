function Crypto() {
    const [cryptoData, setCryptoData] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
  
    async function fetchCryptoData() {
      try {
        console.log('Fetching data...');
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false&_=${new Date().getTime()}`, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Data received:', data); 
        setCryptoData(data);
      } catch (error) {
        console.error('Fetch error:', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    }
  
    React.useEffect(() => {
      fetchCryptoData();
  
      const interval = setInterval(() => {
        fetchCryptoData();
      }, 30000); 
  
      return () => clearInterval(interval);
    }, []);
  
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;
  
    return (
      <div className="crypto-container">
        <h2 className="crypto-heading">Cryptocurrency Prices</h2>
        <ul className="crypto-list">
          {cryptoData.map((crypto) => (
            <li key={crypto.id} className="crypto-item">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <img src={crypto.image} alt={crypto.name} style={{ width: '25px', marginRight: '10px' }} />
                  {crypto.name} ({crypto.symbol.toUpperCase()})
                </div>
                <div>${crypto.current_price.toFixed(2)}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  
  
