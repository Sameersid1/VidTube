🎬 VidTube – Full Stack Video Sharing Platform

VidTube is a YouTube-inspired video streaming platform built using the MERN stack. It allows users to upload, watch, and interact with videos through likes, comments, and subscriptions, providing a real-world scalable application experience.

🚀 Features
🔐 User Authentication & Authorization (JWT-based)
📤 Video Upload & Management (via Cloudinary)
👍 Like / 👎 Unlike Videos
💬 Comment System
📺 Channel Creation & Subscription System
🔍 Explore & Browse Videos
🧠 Efficient Data Fetching using MongoDB Aggregation Pipelines
📱 Fully Responsive UI
🛠️ Tech Stack

Frontend:

React.js
Tailwind CSS
Axios

Backend:

Node.js
Express.js

Database:

MongoDB (Mongoose)

Other Tools & Services:

Cloudinary (Media Storage)
JWT (Authentication)
Multer (File Upload Handling)
📂 Folder Structure
VidTube/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   └── utils/
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   └── services/
│
└── README.md
⚙️ Installation & Setup
1️⃣ Clone the repository
git clone https://github.com/your-username/vidtube.git
cd vidtube
2️⃣ Setup Backend
cd backend
npm install

Create a .env file in backend:

PORT=8000
MONGO_URI=your_mongodb_connection
ACCESS_TOKEN_SECRET=your_secret
REFRESH_TOKEN_SECRET=your_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

Run backend:

npm run dev
3️⃣ Setup Frontend
cd frontend
npm install
npm run dev
🔑 API Highlights
Auth APIs → Register, Login, Logout
Video APIs → Upload, Fetch, Like
Comment APIs → Add, Delete
Subscription APIs → Subscribe / Unsubscribe
📸 Screenshots

(Add your project screenshots here for better impact)

🌟 Learning Outcomes
Built a real-world scalable MERN application
Learned authentication & secure API handling
Implemented complex MongoDB aggregation pipelines
Handled media uploads & optimization
Improved frontend architecture with reusable components
🔮 Future Improvements
🔔 Real-time notifications (Socket.io)
📊 Video analytics dashboard
🎯 Recommendation system
📡 Live streaming support
🤝 Contributing

Contributions are welcome! Feel free to fork this repo and submit a PR.

📬 Contact

Mohd Sameer

GitHub: https://github.com/Sameersid1
LinkedIn: (Add your link)
⭐ Show Your Support

If you like this project, give it a ⭐ on GitHub!