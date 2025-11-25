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

## 🚀 Running the Project

To run the project locally, follow these steps:

1. Navigate to the **client** folder:
   ```bash
   cd client
   ```
2. Install all dependencies:
   ```bash
   npm i
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

The project will now be running locally. Open the provided localhost link in your browser to view it.

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
- [❌✅] Post Overlay  
- [✅] Edit Profile/Channel  
- [✅] Connect  
- [✅] Channel Profile (Self/Other)
- [✅] Channel Home

---

### 👤 Gourav Khakse
- [❌] Admin Portal  
- [❌] Home (Normal User)
- [❌] Profile (Self/Other) 
- [❌] Notification  (Normal, Channel)
- [✅] Games
- [❌] Kids Setting

---

### 👤 Arnav Ranjan
- [❌] Payment / Premium  
- [❌] Chat  (Normal, Channel)
- [❌] Settings
- [❌] Daily Usage  
- [❌] Create Post / Reels / Stories (Channel, Normal)
- [❌] Error Page(Incorrect Route)

---

### 👤 Atin Chowdhury
- [✅❌] Registration Page (All Types)  
- [✅] Login Page (All Types)  
- [✅] Activity Log  
- [✅] Stories  
- [❌] Delete (Normal, Kids, Channel)
- [❌] Kids Home(Landing Page)

---

### 👤 Vakadani Kavyamrutha
- [❌] Kids Profile (Self/Other)  
- [❌] Help / Support  
- [❌] Reels  (Normal, Kids, Channel)
- [❌] Terms & Conditions  
- [❌] Contact Us

---

### 🧾 Notes
- Please keep all commits meaningful and well-labeled.  
- Follow consistent component naming and folder structure.  
- Always work on your **own branch** for each feature before working on it.
