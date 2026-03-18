# 🌶️ NOTTEE9 — Full-Stack Restaurant Web App

**Rourkela's most electrifying multi-cuisine restaurant**  
*Built with Node.js · Express · MongoDB · Vanilla JS · TailwindCSS*

---

## 📁 Project Structure

```
nottee9-app/
├── client/                  ← Frontend (served as static files)
│   ├── index.html           ← Customer-facing website
│   ├── admin.html           ← Admin dashboard
│   ├── css/
│   │   └── style.css        ← Neon LED theme styles
│   └── js/
│       └── main.js          ← All frontend logic + API calls
│
└── server/                  ← Backend API
    ├── server.js            ← Express app entry point
    ├── seed.js              ← DB seeder (menu + admin account)
    ├── package.json
    ├── .env.example         ← Environment variables template
    ├── config/
    │   └── db.js            ← MongoDB connection
    ├── models/
    │   ├── Menu.js          ← Dish schema
    │   ├── Reservation.js   ← Table reservation schema
    │   ├── Event.js         ← Event booking schema
    │   └── Admin.js         ← Admin user schema
    ├── controllers/
    │   ├── menuController.js        ← CRUD + AI recommend
    │   ├── reservationController.js ← Booking + availability
    │   ├── eventController.js       ← Event bookings
    │   └── adminController.js       ← Auth + stats
    ├── routes/
    │   ├── menu.js
    │   ├── reservation.js
    │   ├── event.js
    │   ├── admin.js
    │   └── qr.js
    └── middleware/
        └── auth.js          ← JWT protection middleware
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- [MongoDB](https://www.mongodb.com/try/download/community) running locally **OR** a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

---

### Step 1 — Install Dependencies

```bash
cd server
npm install
```

---

### Step 2 — Configure Environment

```bash
# In the /server folder:
cp .env.example .env
```

Edit `.env`:

```env
MONGODB_URI=mongodb://localhost:27017/nottee9
JWT_SECRET=your_strong_random_secret_here
PORT=5000
ADMIN_EMAIL=admin@nottee9.in
ADMIN_PASSWORD=nottee9@admin
NODE_ENV=development
```

> **MongoDB Atlas?** Replace `MONGODB_URI` with your Atlas connection string.

---

### Step 3 — Seed the Database

```bash
cd server
node seed.js
```

This creates:
- ✅ 30+ menu items across all categories
- ✅ Default admin account (`admin@nottee9.in` / `nottee9@admin`)

---

### Step 4 — Start the Server

```bash
# Development (auto-restart on changes):
npm run dev

# Production:
npm start
```

Server starts at: **http://localhost:5000**

---

### Step 5 — Open in Browser

| Page | URL |
|------|-----|
| 🌶️ Customer Website | http://localhost:5000 |
| 🔒 Admin Dashboard  | http://localhost:5000/admin.html |
| 🔗 API Base         | http://localhost:5000/api |
| ❤️ Health Check     | http://localhost:5000/api/health |

---

## 🔒 Admin Login

```
Email:    admin@nottee9.in
Password: nottee9@admin
```

> Change these credentials in `.env` before going live.

---

## 🌐 API Endpoints

### Menu
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET  | `/api/menu` | Public | All available menu items |
| GET  | `/api/menu/specials` | Public | Today's specials |
| GET  | `/api/menu/categories` | Public | List of categories |
| POST | `/api/menu/recommend` | Public | AI waiter recommendations |
| GET  | `/api/menu/admin/all` | 🔒 Admin | All items (incl. unavailable) |
| POST | `/api/menu` | 🔒 Admin | Add new dish |
| PUT  | `/api/menu/:id` | 🔒 Admin | Update dish |
| DELETE | `/api/menu/:id` | 🔒 Admin | Delete dish |
| PATCH | `/api/menu/:id/toggle-special` | 🔒 Admin | Toggle today's special |
| PATCH | `/api/menu/:id/toggle-offer` | 🔒 Admin | Toggle offer |

### Reservations
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET  | `/api/reservations/availability?date=` | Public | Check seat availability |
| POST | `/api/reservations` | Public | Create reservation |
| GET  | `/api/reservations` | 🔒 Admin | All reservations |
| PATCH | `/api/reservations/:id/status` | 🔒 Admin | Update status |
| DELETE | `/api/reservations/:id` | 🔒 Admin | Delete reservation |

### Events
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/events` | Public | Create event booking |
| GET  | `/api/events` | 🔒 Admin | All event bookings |
| PATCH | `/api/events/:id` | 🔒 Admin | Update event |
| DELETE | `/api/events/:id` | 🔒 Admin | Delete event |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/admin/login` | Public | Admin login (returns JWT) |
| GET  | `/api/admin/me` | 🔒 Admin | Get admin profile |
| GET  | `/api/admin/stats` | 🔒 Admin | Dashboard stats |

### QR Code
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET  | `/api/qr/menu?url=` | Public | Generate menu QR code |

---

## 🤖 AI Waiter — How It Works

The AI Waiter is a **rule-based recommendation engine** (no external AI API needed).

It parses free-text queries to extract:
- **Type**: veg / non-veg keywords
- **Spice**: spicy / mild / hot keywords
- **Budget**: "under ₹300", "below 200", "₹250" patterns
- **Cuisine**: Indian / Chinese / Asian / Healthy
- **Category**: starter / biryani / noodles / dessert

**Example queries:**
```
"Suggest spicy dish under ₹300"     → non-veg, spicy, price ≤ 300
"Recommend veg Chinese starter"     → veg, Chinese, Starter category
"What's special today?"             → isSpecial = true
"Mild healthy food under 250"       → Healthy cuisine, mild, price ≤ 250
```

---

## 🎯 Key Features

| Feature | Status |
|---------|--------|
| Digital menu from MongoDB | ✅ |
| Multi-filter (cuisine, type, spice, budget) | ✅ |
| Today's Specials section | ✅ |
| AI Waiter chatbot | ✅ |
| Table reservation with availability check | ✅ |
| Event / celebration booking | ✅ |
| QR code menu | ✅ |
| Admin dashboard (full CRUD) | ✅ |
| JWT authentication | ✅ |
| WhatsApp reservation confirmation | ✅ |
| Gallery with lightbox | ✅ |
| Neon LED theme | ✅ |
| Fully responsive | ✅ |
| Scroll reveal animations | ✅ |

---

## 🚢 Production Deployment

### Environment
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/nottee9
JWT_SECRET=long_random_production_secret_min_32_chars
PORT=5000
```

### Platforms
- **Railway** / **Render** / **Heroku**: Push the `/server` folder, set env vars
- **MongoDB Atlas**: Free 512MB cluster at mongodb.com/atlas
- **Frontend**: Automatically served as static files from `/client`

---

## 📞 Restaurant Info

| | |
|-|------|
| **Name** | NOTTEE9 |
| **Location** | Sector-4, Rourkela, Odisha 769005 |
| **Phone** | +91 99375 82815 |
| **Hours** | 7:00 AM – 11:00 PM (Daily) |
| **Capacity** | 156 Guests |
| **Cuisine** | Indian · Chinese · Asian · Healthy |

---

*Built with 🌶️ for NOTTEE9 — All The Best!*
