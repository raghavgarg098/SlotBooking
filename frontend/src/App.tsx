import React, { useState } from 'react';
import './App.css';
import LoginPage from './components/loginPage';
import HelloWorldPage from './components/slotsScreen';

enum Page {
  LOGIN = 1,
  HELLO_WORLD = 2,
}

function App() {
  const [page, setPage] = useState<Page>(Page.LOGIN);
  const [user_id, setUserId] = useState<string>('');

  const handleLoginSuccess = (userId: string) => {
    console.log(userId)
    setUserId(userId);
    setPage(Page.HELLO_WORLD);
  };

  return (
    <div className="App">
      <header className="App-header">
        {page === Page.LOGIN && <LoginPage onLoginSuccess={handleLoginSuccess} />}
        {page === Page.HELLO_WORLD && <HelloWorldPage userId={user_id} />}
      </header>
    </div>
  );
}

export default App;
