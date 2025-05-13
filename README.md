# 🚀 Real-Time Collaborative Text Editor

This project is a **real-time collaborative rich text editor** built using **React**, **Firebase (Firestore + Auth)**, and **React-Quill**. It allows multiple users to work together on the same document in **real-time**, showing the **last editor’s name** above the editor.

---

## 📁 Repository: `ramit-roshan-wasserstoff-FrontEndInternTask`

This project was created as part of a **Frontend Internship Task** submission for **Wasserstoff**.

---

## 🧩 Features

- ✨ **Rich Text Editing** using [React Quill](https://github.com/zenoamaro/react-quill)
- 🔄 **Real-time synchronization** of document contents via Firebase Firestore
- 🔐 **Anonymous authentication** through Firebase Auth
- 📝 **Enter your name** before joining the editor (personalized identity per session)
- 👀 Displays **“Last edited by: Ramit Roshan”** above the editor
- 💾 Firestore auto-sync with **throttled updates** using Lodash
- ☁️ Firestore stores both document content and editor metadata

---

## 🧪 How It Works

### 1. **Username Modal**
Upon launching the app, you’ll see a screen:
Enter your name to join the editor
[ Type your name here ] [ Continue ]

The username is saved in local/session storage and associated with a Firebase UID.

---

### 2. **Editor View**

Once you click **Continue**, the rich text editor opens.

![image](https://github.com/user-attachments/assets/93420d6c-750c-4e76-8841-ad7722f4de88)


Above the editor: <br>
Last edited by: [Roshan]

![image](https://github.com/user-attachments/assets/57147740-d2c2-49c1-8f82-547fe4803944)


---

- This dynamically updates based on who made the last change. For example:

Last edited by: Ramit Roshan
 
Now if you (say "Raja Ramchandra") start typing, it changes to:

Last edited by: Raja Ramchandra


---

## 🔐 Firebase Firestore Data Structure

Here’s how Firestore stores the editor content:

![image](https://github.com/user-attachments/assets/e80b4b7a-bc26-4888-9065-f05e49dd5bed)

- content: Quill Delta format for editor content

- lastEditedBy: Firebase Auth UID and the username that last updated the document

- updatedAt: Timestamp of the last edit

---
🛠️ Tech Stack

| Technology  | Purpose                                  |
| ----------- | ---------------------------------------- |
| React       | Front-end development                    |
| Firebase    | Backend (Firestore DB + Auth)            |
| React-Quill | WYSIWYG Rich text editor                 |
| Lodash      | Used for `throttle()` to limit DB writes |
| TypeScript  | Strong typing and better DX              |

---
📂 Folder Structure <br>
src/ <br>
├── components/  <br>
│   └── TextEditor.tsx          <br>
├── firebase-config.ts         <br>
├── App.tsx                    <br>
├── App.css                     <br>
 

---
🌐 Live Demo
🔗 [Live Demo](https://your-demo-url.com)
