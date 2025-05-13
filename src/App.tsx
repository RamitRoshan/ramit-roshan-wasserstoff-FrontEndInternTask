import { useEffect, useState } from 'react';
import './App.css';
import { auth } from './firebase-config';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { TextEditor } from './components/text-editor';

function App() {
  // State to store the users unique ID, username, input value for the username, and loading state
  const [uid, setUid] = useState<string | null>(null); // Store user ID (uid) after authentication
  const [username, setUsername] = useState<string | null>(null); // Store the username of the user
  const [inputValue, setInputValue] = useState(''); // Store the current value in the username input field

  //currently waiting for the user to authenticate.
  const [loading, setLoading] = useState(true);  

  useEffect(() => {

    // Effect hook to handle the Firebase authentication state change
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // If the user is signed in, log their UID and update the state
        console.log('User signed in:', user.uid);
        setUid(user.uid);
        // Set loading to false when the user is authenticated
        setLoading(false);
      } else {
        // If no user is signed in, try signing in anonymously
        try {
          await signInAnonymously(auth);
        } catch (error) {
          // If anonymous sign-in fails, log the error and stop loading
          console.error("Anonymous sign-in failed:", error);
          setLoading(false);
        }
      }
    });
  
    // Cleanup function to unsubscribe from the auth state listener when the component is unmounted
    return () => unsubscribe();
  }, []);

  // Handler for submitting the username after the user enters it
  const handleUsernameSubmit = () => {
    if (inputValue.trim() !== '') {
      // If the input value is not empty, set the username state
      setUsername(inputValue.trim());
    }
  };

  // While the app is loading (authenticating the user), display a loading message
  if (loading) {
    return <p>Signing in...</p>;
  }

  // If the user ID (uid) is not available, display an error message
  if (!uid) {
    return <p>Could not sign in. Plz check Firebase configuration.</p>;
  }

  // If the username is not set yet, show a modal asking the user to enter their name
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

  // Once the user is authenticated and has entered their username, render the collaborative text editor
  return (
    <div className="App">
      <header>
        <h1>Real Time Collaborative Editor</h1>
      </header>
      <TextEditor username={username} uid={uid} />
    </div>
  );
}

export default App;  //export the app component to be used in other parts of the application
