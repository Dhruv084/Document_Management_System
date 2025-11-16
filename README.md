# Document Management System

A comprehensive MERN stack application for college document management with role-based access control for Admin, Faculty, and Students.

## Features

### Authentication
- User registration and login
- Password reset functionality
- JWT-based authentication
- Role-based access control

### Admin Features
- Manage all users (view, activate/deactivate, delete)
- Upload and manage documents
- View system statistics

### Faculty Features
- View and manage student records
- Create and manage notices
- Upload documents with attachments

### Student Features
- View notices and announcements
- Access and download documents
- View academic calendar and events
- Search and filter documents

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Multer** - File upload handling
- **Nodemailer** - Email service

### Frontend
- **React.js** - UI library
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Vite** - Build tool

## Project Structure

```
document-management/
├── backend/
│   ├── models/          # MongoDB models
│   │   ├── User.js
│   │   ├── Notice.js
│   │   ├── Document.js
│   │   └── Calendar.js
│   ├── routes/          # API routes
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── notices.js
│   │   ├── documents.js
│   │   └── calendar.js
│   ├── middleware/      # Custom middleware
│   │   ├── auth.js
│   │   └── upload.js
│   ├── uploads/         # Uploaded files
│   ├── server.js        # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   │   ├── auth/    # Authentication pages
│   │   │   └── dashboard/ # Dashboard pages
│   │   ├── utils/       # Utility functions
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/document_management
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development

# Email Configuration (for forgot password)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@documentmanagement.com

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

4. Start the server:
```bash
npm run dev
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgotpassword` - Request password reset
- `PUT /api/auth/resetpassword/:token` - Reset password
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get single user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin only)
- `GET /api/users/students/list` - Get students (Faculty/Admin)

### Notices
- `GET /api/notices` - Get all notices
- `GET /api/notices/:id` - Get single notice
- `POST /api/notices` - Create notice (Faculty/Admin)
- `PUT /api/notices/:id` - Update notice
- `DELETE /api/notices/:id` - Delete notice

### Documents
- `GET /api/documents` - Get all documents
- `GET /api/documents/:id` - Get single document
- `GET /api/documents/:id/download` - Download document
- `POST /api/documents` - Upload document (Faculty/Admin)
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document

### Calendar
- `GET /api/calendar` - Get all events
- `GET /api/calendar/:id` - Get single event
- `POST /api/calendar` - Create event (Faculty/Admin)
- `PUT /api/calendar/:id` - Update event
- `DELETE /api/calendar/:id` - Delete event

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Admin Dashboard**: 
   - Manage all users in the system
   - Upload and manage documents
   - View system statistics
3. **Faculty Dashboard**:
   - View and search student records
   - Create and manage notices with attachments
4. **Student Dashboard**:
   - View all notices and announcements
   - Search and download documents
   - View academic calendar events

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Protected routes with role-based access
- File upload validation
- Input sanitization

## File Upload

- Supported formats: PDF, Images (JPEG, PNG, GIF), Documents (DOC, DOCX, XLS, XLSX, PPT, PPTX)
- Maximum file size: 10MB (configurable)
- Files are stored in `backend/uploads/documents/`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is open source and available under the MIT License.

## Support

For issues and questions, please open an issue in the repository.

#
