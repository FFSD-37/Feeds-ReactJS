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

```bash
cd server
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

## ⚙️ Project Component Assignment

Each member is assigned **parent components** to develop.  
All components must be placed inside the **`components/`** folder and style should be created in **`styles/`** folder.  
You can create **child components** freely under these parent components.

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
- [✅] Post Overlay
- [✅] Edit Profile/Channel
- [✅] Connect
- [✅] Channel Profile (Self/Other)
- [✅] Channel Home
- [✅] Kids Home(Landing Page)

---

### 👤 Gourav Khakse

- [❌] Admin Portal
- [✅] Home (Normal User)
- [✅] Profile (Self/Other)
- [✅] Notification (Normal, Channel)
- [✅] Games
- [✅] Setting
- [✅] Kids Settings

---

### 👤 Arnav Ranjan

- [✅] Payment / Premium
- [✅] Chat
- [✅] Daily Usage
- [✅] Create Post / Reels / Stories (Channel, Normal)
- [✅] Error Page(Incorrect Route)
- [✅] Redux integration

---

### 👤 Atin Chowdhury

- [✅] Registration Page (All Types)
- [✅] Login Page (All Types)
- [✅] Activity Log
- [✅] Stories
- [✅] Delete (Normal, Kids, Channel)

---

### 👤 Vakadani Kavyamrutha

- [❌] Kids Profile (Self/Other)
- [✅] Help / Support
- [✅] Reels (Normal, Kids, Channel)
- [✅] Terms & Conditions
- [✅] Contact Us

---


## Middlewares Used

### Router level middleware(s)

- isAuthuser : Authenticate the user using cooking parsing

### Built-in middleware(s)

- express.static() : serves the static assets using server-side rendering
- express.urlencoded() : parses the incoming requests with URL-encoded payloads and the make the parsed data available in req.body
- express.json() : parses the incoming requests with JSON payloads.

### Third party middleware(s)

- cookie-parser : It parses the Cookie header from incoming HTTP requests and populates req.cookies with an object keyed by the cookie names, making it easy to read and manage cookies in your route handlers. It also supports signed cookies to prevent tampering.
- cors : It simplifies the process of enabling Cross-Origin Resource Sharing (CORS) in your application. 

## 🧾 Notes

- Please keep all commits meaningful and well-labeled.
- Follow consistent component naming and folder structure.
- Always work on your **own branch** for each feature before working on it.