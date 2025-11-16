# Backend API Documentation

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/document_management
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@documentmanagement.com
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

3. Start the server:
```bash
npm run dev
```

## API Routes

All routes are prefixed with `/api`

### Authentication Routes (`/auth`)
- POST `/register` - Register new user
- POST `/login` - Login user
- POST `/forgotpassword` - Request password reset
- PUT `/resetpassword/:token` - Reset password
- GET `/me` - Get current user (protected)

### User Routes (`/users`)
- GET `/` - Get all users (Admin only)
- GET `/:id` - Get single user
- PUT `/:id` - Update user
- DELETE `/:id` - Delete user (Admin only)
- GET `/students/list` - Get students (Faculty/Admin)

### Notice Routes (`/notices`)
- GET `/` - Get all notices
- GET `/:id` - Get single notice
- POST `/` - Create notice (Faculty/Admin)
- PUT `/:id` - Update notice
- DELETE `/:id` - Delete notice

### Document Routes (`/documents`)
- GET `/` - Get all documents
- GET `/:id` - Get single document
- GET `/:id/download` - Download document
- POST `/` - Upload document (Faculty/Admin)
- PUT `/:id` - Update document
- DELETE `/:id` - Delete document

### Calendar Routes (`/calendar`)
- GET `/` - Get all events
- GET `/:id` - Get single event
- POST `/` - Create event (Faculty/Admin)
- PUT `/:id` - Update event
- DELETE `/:id` - Delete event

## Authentication

Most routes require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## File Upload

For file uploads, use `multipart/form-data` content type. The file field should be named `file` for documents or `attachments` for notice attachments.

