import { useEffect, useState } from 'react';
import './App.css';
import { auth } from './firebase-config';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { TextEditor } from './components/text-editor';

function App() {
  const [uid, setUid] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);  

  useEffect(() => {

    // Sign in anonymously if no user is logged in
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log('User signed in:', user.uid);
        setUid(user.uid);
        setLoading(false);
      } else {
        try {
          await signInAnonymously(auth);
        } catch (error) {
          console.error("Anonymous sign-in failed:", error);
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleUsernameSubmit = () => {
    if (inputValue.trim() !== '') {
      setUsername(inputValue.trim());
    }
  };

  if (loading) {
    return <p>Signing in...</p>;
  }

  if (!uid) {
    return <p>Could not sign in. Please check Firebase configuration.</p>;
  }

  if (!username) {
    return (
      <div className="username-modal">
        <h2>Enter your name to join the editor</h2>
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="Enter your name"
        />
        <button onClick={handleUsernameSubmit}>Continue</button>
      </div>
    );
  }

  return (
    <div className="App">
      <header>
        <h1>Real Time Collaborative Editor</h1>
      </header>
      <TextEditor username={username} uid={uid} />
    </div>
  );
}

export default App;

