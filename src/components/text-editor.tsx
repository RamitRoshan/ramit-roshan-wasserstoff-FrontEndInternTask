import { useRef, useEffect, useState } from "react";
import ReactQuill from "react-quill";
import { setDoc, doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase-config";
import "react-quill/dist/quill.snow.css";
import "../App.css";
import { throttle } from "lodash";

interface Props {
  username: string;
  uid: string;
}

export const TextEditor = ({ username, uid }: Props) => {
  const quillRef = useRef<ReactQuill | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [lastEditor, setLastEditor] = useState<string | null>(null);
  const isLocalChange = useRef(false);

  const documentRef = doc(db, "documents", "sample-doc");

  const saveContent = throttle(() => {
    if (quillRef.current && isLocalChange.current) {
      const content = quillRef.current.getEditor().getContents();
      console.log(`Saving content to db: `, content);

      setDoc(
        documentRef,
        {
          content: content.ops,
          lastEditedBy: { uid, username },
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      )
        .then(() => console.log("Content saved"))
        .catch(console.error);

      isLocalChange.current = false;
    }
  }, 1000);

  useEffect(() => {
    if (quillRef.current) {
      // Load initial content from Firestore
      getDoc(documentRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const savedContent = docSnap.data().content;
            const lastEditedBy = docSnap.data().lastEditedBy;
            if (savedContent) {
              quillRef.current.getEditor().setContents(savedContent);
            }
            if (lastEditedBy?.username) {
              setLastEditor(lastEditedBy.username);
            }
          } else {
            console.log("No doc found, starting with an empty editor.");
          }
        })
        .catch(console.error);

      // Real-time listener
      const unsubscribe = onSnapshot(documentRef, (snapshot) => {
        if (snapshot.exists()) {
          const newContent = snapshot.data().content;
          const editorInfo = snapshot.data().lastEditedBy;

          if (editorInfo?.username) {
            setLastEditor(editorInfo.username);
          }

          if (!isEditing) {
            const editor = quillRef.current!.getEditor();
            const currentCursorPosition = editor.getSelection()?.index || 0;

            editor.setContents(newContent, "silent");
            editor.setSelection(currentCursorPosition);
          }
        }
      });

      // Local editor change
      const editor = quillRef.current.getEditor();
      editor.on("text-change", (delta: any, oldDelta: any, source: any) => {
        if (source === "user") {
          isLocalChange.current = true;
          setIsEditing(true);
          saveContent();

          setTimeout(() => setIsEditing(false), 5000);
        }
      });

      return () => {
        unsubscribe();
        editor.off("text-change");
      };
    }
  }, []);

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
