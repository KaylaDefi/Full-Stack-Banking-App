function Home(){
    return (
      <Card
        bgcolor="primary"
        txtcolor="white"
        header="Wild Frontier Bank"
        title="Welcome to the bank!"
        text="You can move around using the navigation bar."
        body={(<img src="wildfrontier.jpg" className="img-fluid" alt="Responsive image"/>)}
      />    
    );  
  }