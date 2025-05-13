import { useRef, useEffect, useState } from "react";
import ReactQuill from "react-quill";
import { setDoc, doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase-config";
import "react-quill/dist/quill.snow.css";
import "../App.css";
import { throttle } from "lodash";

interface Props {
  username: string; // It will be the name of the user editing the document
  uid: string;  // Unique ID for the user (used for identifying who edited the document)
}

export const TextEditor = ({ username, uid }: Props) => {
  const quillRef = useRef<ReactQuill | null>(null); //reference of the react-quill editor, so we can interact with it directly
  const [isEditing, setIsEditing] = useState<boolean>(false);  //this keeps track of whether the user is currently editing
  const [lastEditor, setLastEditor] = useState<string | null>(null); // It stores the name of the last person to edit the document
  const isLocalChange = useRef(false);  // A reference to track if the content change is from the local user.

   // Firestore document reference where all content will be stored.
  const documentRef = doc(db, "documents", "sample-doc");

  // A throttled function to save the content to Firestore. Throttling means we only save once every second to avoid overwhelming the database.
  const saveContent = throttle(() => {
    if (quillRef.current && isLocalChange.current) {  // Check if the editor is there and if the change is local
      const content = quillRef.current.getEditor().getContents();   //get the content of the editor in a structured format
      console.log(`Saving content to db: `, content);  //log the content we are about to save

      // Save the content to Firestore. This also stores who made the last edit and when it was updated.
      setDoc(
        documentRef,
        {
          content: content.ops,   // Save the content as "ops", which is how quill stores its content
          lastEditedBy: { uid, username }, // Save the current users information (UID and name)
          updatedAt: new Date().toISOString()  //timestamp for when the document was updated
        },
        { merge: true }   // We want to merge this new data with the existing document, not overwrite it
      )
        .then(() => console.log("Content saved"))
        .catch(console.error);  // If saving fails, log the error

      isLocalChange.current = false;   // Reset the change tracker as we have just saved the content.
    }
  }, 1000); // throttled to save no more than once every sec.

  useEffect(() => {
    if (quillRef.current) {
      // When the component mounts, Load initial content from Firestore
      getDoc(documentRef)
        .then((docSnap) => {
          if (docSnap.exists()) { // If the document exists in Firestore, load its content
            const savedContent = docSnap.data().content;  // get the saved content
            const lastEditedBy = docSnap.data().lastEditedBy; //get the info of the last person who edited it.

            if (savedContent) {
              quillRef.current.getEditor().setContents(savedContent); // load saved content into editor
            }
            if (lastEditedBy?.username) {
              setLastEditor(lastEditedBy.username);  // set the name of the last editor for display
            }
          } else {
            // If no document exists, just start with a empty editor.
            console.log("No doc found, starting with an empty editor."); 
          }
        })
        .catch(console.error); // If fetching the document fails, log the error

      // Now we add a real-time listener to Firestore to keep the editor in sync with any changes made by others
      const unsubscribe = onSnapshot(documentRef, (snapshot) => {
        if (snapshot.exists()) { //when we received new data from Firestore
          const newContent = snapshot.data().content; // get the updated content
          const editorInfo = snapshot.data().lastEditedBy; //get information about who made the update

          if (editorInfo?.username) {
            setLastEditor(editorInfo.username); // Update the last editor's name
          }

          // If we are not currently editing then avoid overwriting the local changes.
          if (!isEditing) {
            const editor = quillRef.current!.getEditor();  // get the Quill editor instance
            const currentCursorPosition = editor.getSelection()?.index || 0;  // get cursor position

            editor.setContents(newContent, "silent"); // Update the editor content without triggering any events
            editor.setSelection(currentCursorPosition); //reset the cursor to its original position
          }
        }
      });

       // Adding event listener to track text changes made by the local user
      const editor = quillRef.current.getEditor();
      editor.on("text-change", (delta: any, oldDelta: any, source: any) => {

        // If the change is coming from the user.
        if (source === "user") {
          isLocalChange.current = true; //mark this as a local change
          setIsEditing(true);  //set editing state to true
          saveContent(); // Save content in Firestore

        //After 5 sec, mark the editing state as false, it means the user stopped editing.
          setTimeout(() => setIsEditing(false), 5000);
        }
      });

      // Clean-up fn to remove the listener when the component unmounts
      return () => {
        unsubscribe();   //remove the firestore listener
        editor.off("text-change"); //remove the text-change event listener from the Quill editor
      };
    }
  }, []); // empty array, it means this effect runs only once when the component 1st mounts

  return (
    <div className="real-time-collaborative-editor p-4">
      {lastEditor && (
        <p className="text-sm text-gray-500 mb-2">
          Last edited by: <strong>{lastEditor}</strong>
        </p>
      )}
      <ReactQuill ref={quillRef} />
    </div>
  );
};
