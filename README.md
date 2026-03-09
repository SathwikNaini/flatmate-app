# FlatmateFinder

FlatmateFinder is a full-stack, real-time web application designed to help users find their ideal flatmates based on compatibility, location, and lifestyle preferences. 

## Features
- **Real-Time Chat:** Instant messaging powered by **Socket.io** with live typing indicators.
- **Voice & Video Calls:** Built-in peer-to-peer browser calling via **WebRTC**.
- **User Discovery & Matching:** Browse and search for potential flatmates by location, budget, gender, and occupation with automated compatibility scoring.
- **Profile Image Uploads:** Secure local image upload functionality using `multer` and Express.
- **Interactive UI:** A highly responsive, glassmorphic design built purely with React and custom CSS (no Tailwind required). 
- **User Preferences:** Toggleable database-synced email, push, matches, and messages notification settings.
- **Secure Authentication:** JWT-based user session handling and password hashing using `bcryptjs`.

## 🛠️ Tech Stack
- **Frontend:** React 19, Vite, React Router DOM, Socket.io-client, Simple-Peer (WebRTC)
- **Backend:** Node.js, Express, Socket.io
- **Database:** MySQL (mysql2/promise)
- **Storage:** Local disk uploads (`multer`)

## Local Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SathwikNaini/flatmate-app.git
   cd flatmate-app
   ```

2. **Install dependencies (Frontend & Backend):**
   ```bash
   npm install
   ```

3. **Database Configuration:**
   - Install MySQL and ensure the server is running.
   - Run the provided SQL schema script inside `server/schema.sql` to initialize your database tables.

4. **Environment Variables:**
   Create a `.env` file in the root directory and add the following:
   ```env
   VITE_API_URL=http://localhost:3002
   PORT=3002
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=flatmate_db
   DB_PORT=3306
   JWT_SECRET=your_super_secret_jwt_string
   ```

5. **Start the Development Servers:**
   Open two terminal windows:
   - Terminal 1 (Backend): `npm run server`
   - Terminal 2 (Frontend): `npm run dev`

6. **Open in Browser:**
   Navigate to `http://localhost:5173` to view the application!

##  Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.
