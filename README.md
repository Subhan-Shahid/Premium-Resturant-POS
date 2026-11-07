# 🍽️ DineFlow — Premium Restaurant Management System & POS

An all-in-one, modern, high-performance Restaurant Management System (RMS) and Point of Sale (POS) terminal built with **React 18**, **Tailwind CSS**, **Lucide Icons**, and **Zustand**. Designed for fine dining, cafes, bistros, fast-casual restaurants, and cloud kitchens.

---

## 🌟 Key Features & Modules

### 1. ⚡ Restaurant Point of Sale (POS)
- **Multi-Channel Ordering**: Instant toggle between **Dine-In**, **Takeaway**, and **Delivery**.
- **Floor Table Assignment**: Pick tables with visual live occupancy indicators.
- **Modifiers & Customizations**: Dish variations (*Small / Medium / Large, Meat Temps*), add-ons (*Extra Cheese, Truffle Glaze*), and custom kitchen instructions (*"No onions", "Extra spicy"*).
- **Dual Thermal Printing**: One-click generation of **Kitchen Order Tickets (KOT)** and **Itemized Customer Bills / Tax Invoices**.

### 2. 🪑 Interactive Tables & Floor Plan
- **Multi-Section Floor Plan**: Visual management across Ground Floor, 1st Floor Terrace, VIP Lounges, and Outdoor Dining.
- **Real-Time Table Status**: Clear visual badges for *Available (Green)*, *Occupied (Rose)*, *Reserved (Amber)*, and *Billed (Purple)*.
- **Table Operations**: Dynamic order linking, elapsed dining timers, table transfers, and table capacity configuration.

### 3. 👨‍🍳 Kitchen Display System (KDS)
- **Live Ticket Board**: Real-time kitchen order dispatch categorized by preparation status (*Pending → Cooking → Ready to Serve → Served*).
- **Urgency Alerts**: Color-coded elapsed time badges:
  - 🟢 **< 10 mins**: Fresh order
  - 🟡 **10–20 mins**: In progress
  - 🔴 **> 20 mins**: Urgency alert with active pulse
- **Ticket Reprinting**: Instant reprint for thermal kitchen printers.

### 4. 📖 Culinary Menu Catalog
- Categorized food items with dietary indicators (*Vegetarian 🥗, Non-Vegetarian 🥩*), spiciness ratings (*🌶️*), preparation duration, and high-res imagery.
- Instant **"In Stock / 86'd (Sold Out)"** switch to prevent ordering unavailable dishes.
- Real-time food cost and gross margin calculations per dish.

### 5. 📅 Guest Table Reservations
- Booking schedule tracking customer name, contact phone, party size, date/time, and table allocation.
- Custom occasion notes (*Anniversaries, corporate dinners, dietary allergies*).
- **"Seat Guests"** action: instantly seats arrivals, updates table status to occupied, and launches the ticket.

### 6. 📦 Raw Ingredient & Kitchen Inventory
- Tracks raw supplies (*kg, liters, pcs, cans*) with minimum safety reorder thresholds.
- Low-stock warning banners when inventory dips below minimum levels.
- **Food Spoilage & Wastage Tracking**: Log kitchen losses directly into operational daily expenses.

### 7. 📊 Executive Dashboard & Analytics
- Live operational metrics: Daily Revenue, Table Occupancy Rate %, Active KDS tickets, Average Order Value (AOV).
- Sales channel distribution (*Dine-In vs. Takeaway vs. Delivery*).
- Top 5 best-selling menu items ranked by volume and revenue.
- Comprehensive tax & service charge collection audits and server leaderboard.

---

## 🔒 Security Architecture & Access Control

DineFlow incorporates restaurant-grade software security checks:

1. **Role-Based Access Control (RBAC)**:
   - Strict route guards (`ProtectedRoute`) and dynamic navigation filters.
   - Unauthorized attempts by staff to access administrative pages (such as `/settings`, `/users`, `/reports`) are intercepted and blocked.
2. **Password Security**:
   - Implements native **Web Crypto API (SHA-256 with salt)** for password hashing.
   - Plaintext passwords are never visible or exposed in state backups.
3. **Inactivity Lock & Terminal Screen Lock**:
   - Automatic 15-minute idle detection locks POS terminals in high-traffic areas.
   - Quick one-click **Lock Terminal** button in the top navigation header requiring password or PIN verification to resume.
4. **XSS Protection**:
   - Complete input sanitization on all user-supplied variables rendered in thermal receipt preview frames.
5. **Encrypted Offline Data Backups**:
   - Secure JSON backup export and restore utility with schema validation in Settings to ensure business continuity.

---

## 👥 Default Demo Accounts

Test the system using any of the pre-configured role profiles:

| Role | Username | Password | Default Landing | Access Level |
| :--- | :--- | :--- | :--- | :--- |
| **Manager / Admin** | `admin` | `admin123` | `/dashboard` | Full system access |
| **Cashier** | `cashier` | `cashier123` | `/pos` | POS, Tables, KDS, Order History |
| **Waiter** | `waiter` | `waiter123` | `/tables` | Tables, POS, Reservations |
| **Head Chef** | `kitchen` | `kitchen123` | `/kitchen` | Kitchen KDS, Menu Stock, Inventory |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/Subhan-Shahid/Premium-Resturant-POS.git
cd Premium-Resturant-POS

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build
```bash
npm run build
npm run preview
```

---

## 🛠️ Tech Stack

- **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing**: [React Router DOM v6](https://reactrouter.com/)
- **State & Local Persistence**: [Zustand](https://github.com/pmndrs/zustand) (`persist` middleware to `localStorage`)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Charcoal dark mode & modern UI theme)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts & Data**: [Chart.js](https://www.chartjs.org/) + [react-chartjs-2](https://react-chartjs-2.js.org/)
- **Security**: Native Web Crypto API (SHA-256)

---

## 📄 License
This project is licensed under the MIT License.
