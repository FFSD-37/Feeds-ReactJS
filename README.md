# FSD - Group 37

### 🧩 Branch Commands

#### 🔹 Check available branches

```bash
git branch
```

Displays all branches and highlights the one you’re currently on.

#### 🔹 Create a new branch

```bash
git checkout -b branchname
```

Creates a new branch and switches to it immediately.

#### 🔹 Switch between branches

```bash
git checkout branchname
```

**Tip:** You can quickly switch back to the **previous branch** using:

```bash
git checkout -
```

---

### 🗑️ Deleting Branches

#### Delete a branch (safe mode)

```bash
git branch -d branchname
```

Only works if the branch has **no unmerged changes**.

#### Force delete a branch

```bash
git branch -D branchname
```

Use this if you still want to delete a branch with **unmerged changes**.

---

### ☁️ Pushing a Branch to Remote

```bash
git push origin branchname
```

### ☁️ Pulling a Branch to Remote

```bash
git pull origin main
```

---

# 🚀 Running the Project (Client + Server)

## 1️⃣ Clone the project

```bash
git clone <repo-link>
```

## 2️⃣ Run the Client

```bash
cd client
npm i
npm run dev
```

## 3️⃣ Run the Server

Before starting the server, create a local `.env` from the provided example and fill in the required values:

- If you are on macOS / Linux:

```bash
cd server
cp .env-example .env
# then edit .env (e.g. `nano .env` or `code .env`)
```

- If you are on Windows (cmd/powershell):

```powershell
cd server
copy .env-example .env
# then edit .env (e.g. `notepad .env` or `code .env`)
```

Common keys (refer to `server/.env-example` for the exact names) — do NOT commit real secrets:

```text
PORT=3000
EMAIL_USER=
EMAIL_PASS=
DEFAULT_USER_IMG=https://ik.irzp_test_f7KvjxjG0mJxq1magekit.io/FFSD0037/default_user.png?updatedAt=1741701160385
MONGOPASS=
adminUsername=admin
adminPass=pass
adminEmail=
USER_SECRET=
RAZORPAY_SECRET=
MERCHANT_ID=
```

Now install and run the server:

```bash
npm i
npm start
```

The project will now be running locally. Open the provided localhost link in your browser to view it.

---

# 📤 How to Push Your Changes

```bash
git add .
git commit -m "your message"
git push origin branchname
```

---

### 🧠 Guidelines

- Inside every component, **variable names should start with the component name** to prevent naming conflicts.  
  Example:  
  If your component is named `profile_card`, your variables could be:  
  `profile_card_name`, `profile_card_age`, `profile_card_email`, etc.

- Use **Tailwind CSS** for quick and clean structuring.

- Ensure all **forms are validated** (all required fields).

- If you have **any doubts**, ask in the **WhatsApp GROUP chat**.

- You may **exchange pages mutually** if you’re not comfortable with your current assignment.

---

## 📋 Component Distribution & Status

### 👤 Ayush

- [✅] Sidebar
- [✅] Channel Post Overlay
- [✅] Edit Profile/Channel
- [✅] Connect
- [✅] Channel Profile (Self/Other)
- [✅] Channel Home
- [✅] Kids Home
- [✅] Channel Settings

---

### 👤 Gourav Khakse

- [✅] Admin Portal
- [✅] Home (Normal User)
- [✅] Profile (Self/Other)
- [✅] Notification
- [✅] Games
- [✅] Settings
- [✅] Kids Settings

---

### 👤 Arnav Ranjan

- [✅] Payment / Premium
- [✅] Chat
- [✅] Daily Usage
- [✅] Create Post / Reels / Stories
- [✅] Error Page(Incorrect Route)
- [✅] Redux integration

---

### 👤 Atin Chowdhury

- [✅] Registration Page (All Types)
- [✅] Login Page (All Types)
- [✅] Activity Log
- [✅] Stories
- [✅] Delete (Normal, Kids)

---

### 👤 Vakadani Kavyamrutha

- [❌] Kids Profile (Self/Other)
- [✅] Help / Support
- [✅] Reels (Normal, Kids, Channel)
- [✅] Terms & Conditions
- [✅] Contact Us

---


## Middlewares Used

### Router-Level Middleware(s)

- Authentication middleware  
  Used to authenticate users using JWT tokens stored in cookies.  
  Cookies are parsed and verified before allowing access to protected routes and socket connections.

---

### Built-in Express Middleware(s)

- express.json()  
  Parses incoming requests with JSON payloads and makes the parsed data available in req.body.

- express.urlencoded({ extended: true })  
  Parses incoming requests with URL-encoded payloads (typically from HTML form submissions) and exposes the data on req.body.

---

### Third-Party Middleware(s)

- cookie-parser  
  Parses the Cookie header from incoming HTTP requests and populates req.cookies, making cookie handling simple and reliable.

- cors  
  Enables Cross-Origin Resource Sharing (CORS), allowing the frontend application running on a different origin to communicate securely with the backend while supporting credentials such as cookies.

- socket.io middleware  
  Used to authenticate socket connections during the handshake phase by validating JWT tokens extracted from cookies.

---

### Custom Middleware(s)

- 404 route handler  
  Handles all unmatched routes by forwarding a 404 error to the global error handler.

- Global error handler  
  Centralized error-handling middleware that captures and formats application errors consistently.

- Logger using morgan  
  Centralized logging middleware for POST, PUT and DELETE requests to be logged in mongodb schema.


## 🧾 Notes

- Please keep all commits meaningful and well-labeled.
- Follow consistent component naming and folder structure.

- Always work on your **own branch** for each feature before working on it.
