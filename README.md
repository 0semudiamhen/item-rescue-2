# CU Item Rescue
## Smart Lost and Found Management System for Central University

CU Item Rescue is a web-based lost and found management system designed for Central University, Ghana. It gives students and staff a simple way to report lost or found items, upload images, share contact details, and track whether an item has been resolved. The project was developed as a final year university project to make campus item recovery faster, more organized, and easier to manage.

The idea behind the system is straightforward: when an item is misplaced on campus, the person who found it or the person who lost it should not have to rely only on word-of-mouth or informal notice boards. CU Item Rescue brings that process online in a structured and accessible way.

---

## 1. Project Overview

CU Item Rescue is a practical solution for a very familiar problem on university campuses. Items such as phones, wallets, bags, laptops, chargers, and documents are often misplaced or left behind in classrooms, hostels, cafeterias, or offices. This system gives users a central place to report and discover such items.

The platform is intended for:
- Students who have lost something
- Students who have found something
- Administrators who need to manage reports and users
- The wider university community

---

## 2. Features

### Authentication and Access
- Student registration with Central University email validation
- Login using either email or index number
- Password-based authentication with JWT
- “Remember me” option during login
- Password reset using email-based OTP
- Change password functionality
- Admin-only access for system management

### Item Management
- Post lost or found items
- Add title, description, category, location, and date
- Upload one image for each item
- Choose a contact method: school email, personal email, or phone
- Mark items as resolved
- Delete items that are no longer relevant
- Browse items with search and type-based filtering

### Admin Functions
- View system statistics
- View all registered users
- View all posted items
- Delete users
- Delete items
- Resolve items from the admin interface

### Additional Functionality
- Student Services option for found items
- Image preview before submission
- Responsive user interface for campus use
- Cloudinary integration for image storage

---

## 3. Tech Stack

| Layer | Technology | Why it was used |
|---|---|---|
| Frontend | HTML, CSS, JavaScript | Used to build the user interface and client-side interactions |
| Backend | Node.js, Express.js | Chosen for a lightweight and efficient server-side application |
| Database | MongoDB with Mongoose | Used to store users, items, and related data in a flexible document-based structure |
| Authentication | JSON Web Tokens, bcrypt.js | Used to secure login sessions and protect private routes |
| Email | Brevo | Used for OTP verification and password reset emails |
| File Upload | Multer, Cloudinary | Used for handling and storing item images |
| Environment Handling | dotenv | Used to manage configuration settings securely |
| Cross-Origin Access | CORS | Used to allow the frontend to communicate with the backend |

---

## 4. Project Structure

```text
item-rescue-2/
├── client/
│   ├── css/
│   │   └── styles.css
│   ├── images/
│   ├── js/
│   │   ├── admin.js
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   ├── forgot-password.js
│   │   ├── items.js
│   │   ├── main.js
│   │   ├── profile.js
│   │   └── ui.js
│   ├── admin.html
│   ├── admin-items.html
│   ├── admin-users.html
│   ├── change-password.html
│   ├── dashboard.html
│   ├── forgot-password.html
│   ├── how-to.html
│   ├── index.html
│   ├── login.html
│   ├── post-item.html
│   ├── profile.html
│   ├── signup.html
├── server/
│   ├── config/
│   │   └── cloudinary.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Item.js
│   │   └── User.js
│   ├── routes/
│   │   ├── admin.js
│   │   └── auth.js
│   └── server.js
├── package.json
├── README.md
└── test-brevo.js
```

### Folder Overview
- client: Frontend pages, styles, and JavaScript files
- server: Backend server, routes, models, middleware, and configuration
- server/routes: Authentication and admin API routes
- server/models: Mongoose schemas for users and items
- server/config: Cloudinary configuration for image uploads

---

## 5. Getting Started

### Prerequisites
Before running this project, make sure you have:
- Node.js and npm installed
- A MongoDB database (MongoDB Atlas is recommended)
- A Cloudinary account
- A Brevo account for sending emails
- VS Code with the Live Server extension for the frontend preview

### 1. Clone the repository
```bash
git clone <repository-url>
cd item-rescue-2
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a file named .env in the project root and add the variables listed in the next section.

### 4. Run the backend
```bash
npm run dev
```

The backend will run on:
```text
http://localhost:8000
```

### 5. Run the frontend
Open the client folder in VS Code and launch index.html with Live Server.

The frontend is typically served at:
```text
http://127.0.0.1:5500
```

> The frontend currently calls the backend at http://localhost:8000, so the backend must be running before using the application.

---

## 6. Environment Variables

Create a .env file in the project root with the following variables:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
BREVO_API_KEY=your_brevo_api_key
EMAIL_USER=your_sender_email
EMAIL_PASS=your_email_password_or_app_password
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Variable Descriptions
| Variable | Purpose |
|---|---|
| MONGODB_URI | Connection string for the MongoDB database |
| JWT_SECRET | Secret key used to sign authentication tokens |
| BREVO_API_KEY | API key for sending emails through Brevo |
| EMAIL_USER | Sender email address used for OTP and password reset messages |
| EMAIL_PASS | Password or app password for the sender account |
| CLOUDINARY_CLOUD_NAME | Cloudinary cloud name |
| CLOUDINARY_API_KEY | Cloudinary API key |
| CLOUDINARY_API_SECRET | Cloudinary API secret |

---

## 7. API Routes

The backend is available at:
```text
http://localhost:8000
```

### Authentication Routes
| Method | Route | Description |
|---|---|---|
| POST | /api/auth/send-otp | Registers a new student account and sends an OTP |
| POST | /api/auth/verify-otp | Verifies the OTP received during signup |
| POST | /api/auth/login | Authenticates a user and returns a JWT |
| GET | /api/auth/me | Returns details of the currently authenticated user |
| POST | /api/auth/forgot-password | Sends a password reset OTP |
| POST | /api/auth/reset-password | Resets the password using the reset OTP |
| POST | /api/auth/change-password | Changes the user’s password |

### Item Routes
| Method | Route | Description |
|---|---|---|
| POST | /api/items | Creates a new lost or found item |
| GET | /api/items | Returns all active public items |
| GET | /api/items/mine | Returns items posted by the authenticated user |
| PATCH | /api/items/:id/resolve | Marks an item as resolved |
| DELETE | /api/items/:id | Deletes an item posted by the authenticated user |

### Admin Routes
| Method | Route | Description |
|---|---|---|
| GET | /api/admin/stats | Returns dashboard statistics |
| GET | /api/admin/users | Returns all registered users |
| DELETE | /api/admin/users/:id | Deletes a user |
| GET | /api/admin/items | Returns all items for admin management |
| DELETE | /api/admin/items/:id | Deletes any item from the system |

---

## 8. Email and OTP Setup

The project uses Brevo for transactional emails such as OTP verification, password reset messages, and other notifications.

### Current OTP behavior
Signup OTP is implemented in the authentication route, but it is currently disabled by a SKIP_OTP flag. In the current setup, account creation can proceed without OTP verification.

### How to enable OTP properly
To enable full OTP-based signup:
1. Change the SKIP_OTP value from true to false
2. Make sure your Brevo account is configured correctly
3. Use a verified sender email or sender domain
4. Confirm that the sender address is accepted by your email service

### Important note
Because this project is intended for a university setting, emails sent to school Google Workspace accounts may sometimes be filtered into spam or promotional folders. If OTP emails are not arriving reliably, it is recommended to configure a custom sender domain such as @central.edu.gh or a verified professional sender address.

### Forgot password and change password
Forgot password and change password both use OTP and email delivery through Brevo and are active in the current implementation.

---

## 9. Image Upload

Item images are stored using Cloudinary. This keeps image handling separate from the main server and makes uploads easier to manage.

### Image behavior
- Images are uploaded when a user posts an item
- The image URL and public ID are stored in the database
- When an item is deleted, the related image is also removed from Cloudinary if possible

---

## 10. Known Limitations and Future Work

### Current limitations
- OTP emails may be delayed or land in spam for school email accounts until a verified university sender is configured
- The current OTP store is temporary and lives in memory, so pending OTP requests may be lost if the server restarts
- The current implementation is a functional MVP focused on the core lost-and-found workflow

### Possible future improvements
- Add a more polished claims workflow between finders and owners
- Improve admin moderation and reporting tools
- Add real-time notifications
- Introduce mobile-friendly enhancements
- Add advanced search and filtering features
- Expand analytics for lost and found trends across campus

---

## 11. Academic Context

This project was developed as a final year academic project for the Department of Computer Science and Information Technology at Central University.

### Project Team
- Osei-Prempeh Agyeiwaa Genesis
- Okoekoh Joseph Osemudiahen

### Supervisor
- Mr. Fredrick Gardiner

### Methodology
- Agile development approach

This project reflects the practical application of software engineering principles, database design, web development, system integration, and user-centered design in a real-world university context.

---

## 12. License

This project is a Central University final year project and is intended for academic and demonstration purposes. It is not intended for commercial use without permission.
