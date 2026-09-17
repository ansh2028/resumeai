# 🏰 The Secret Toy Clubhouse — How Your Backend Works!

Welcome to the guide! Here is the story of everything you built, explained so simply that anyone can understand it.

---

## 🗺️ The Big Picture

When someone uses your app to register, here is the journey their information takes:

```
[ Visitor / User ]
        │
        ▼ (knocks on door 3000)
[ server.js ]  ──► (Turns on the clubhouse & plugs in database)
        │
        ▼ (enters lobby)
[ app.js ]     ──► (Translates the message using express.json)
        │
        ▼ (follows the hallway sign /api/auth)
[ auth.routes.js ] ──► (Sends visitor to the /register desk)
        │
        ▼ (talks to the officer)
[ auth.controller.js ] ──► (Checks if boxes are filled & checks database)
        │
        ▼ (uses the blank member form)
[ user.model.js ] ──► (Saves or finds member in MongoDB Atlas)
```

---

## 1. 🔒 `.env` (The Secret Locker)
* **What it is:** A hidden file where you keep your private secrets.
* **Analogy:** You wouldn't write your house key code on your front door! `.env` keeps passwords (like your MongoDB connection string) hidden so nobody on GitHub or the internet can steal it.

---

## 2. ⚡ `server.js` (The Main Power Switch)
* **What it is:** The entry point of your whole program.
* **Analogy:** Flipping on the power switch in the morning:
  1. Wakes up the app.
  2. Calls the database to make sure it's connected.
  3. Opens **Port 3000** (like door #3000) so visitors can start knocking.

---

## 3. 📞 `src/config/database.js` (The Phone Line to the Warehouse)
* **What it is:** The code that connects your server to MongoDB.
* **Analogy:** MongoDB is a giant cloud warehouse. `database.js` picks up the phone, dials your secret MongoDB address, and says: *"Hey warehouse, we're open! Get ready to store some member files!"*

---

## 4. 📝 `src/config/models/user.model.js` (The Blank Member Form)
* **What it is:** A Mongoose "Schema" (blueprint).
* **Analogy:** A blank paper form you hand to someone joining your club:
  - **Username:** Must be written, and cannot be a copy of an existing member's username.
  - **Email:** Must be written, all lowercase, and unique.
  - **Password:** Must be written so they can unlock their account later.

---

## 5. 🏢 `src/app.js` (The Clubhouse Lobby)
* **What it is:** The central place where Express sets up the rules and hallways.
* **Analogy:** 
  - `express.json()` is a **translator** sitting in the lobby. When a computer sends raw text, it translates it into a clean JavaScript object (`req.body`).
  - It also directs traffic: *"If you want to sign up or log in, head down the `/api/auth` hallway!"*

---

## 6. 🚪 `src/routes/auth.routes.js` (The Room Signpost)
* **What it is:** A router that maps URLs to code.
* **Analogy:** A signpost in the hallway that says:
  > *"If you want to `/register`, walk into Room 1 where the Registration Officer is waiting!"*

---

## 7. 👮 `src/controllers/auth.controller.js` (The Registration Officer)
* **What it is:** The brain/logic for handling registrations.
* **Analogy:** The officer sitting at the desk does this step-by-step:
  1. **Inspects the paper:** Did you write a username, email, and password? If any box is empty, they stop you: *"Hey, all fields are required!"*
  2. **Checks the club register (`findOne`):** Does someone with that email or username already exist? If yes, they say: *"Sorry, this user already exists!"*
  3. **Next step (coming up):** Scramble the password securely (hashing) and save the new member into MongoDB!

---

## 🛠️ Helpful Things to Fix in Your Files

1. **In `src/controllers/auth.controller.js`:**
   - Make sure the function name matches what you export:
     ```javascript
     async function registerUserController(req, res) { ... }
     module.exports = { registerUserController };
     ```
2. **In `src/app.js`:**
   - Remove the unfinished `authRouter.post(...)` block at the bottom of `app.js` because you already have it in your routes file!
3. **In `src/routes/`:**
   - Rename `auht.routes.js` to `auth.routes.js` (to fix the typo in "auth").
