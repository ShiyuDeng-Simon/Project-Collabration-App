# Project Collaboration App

A full-stack web application for project collaboration and task management with Google OAuth authentication.

## Features

- 🔐 **Google OAuth Authentication** - Secure login with Google accounts
- ✅ **Task Management** - Create, update, and delete tasks with progress tracking
- 📊 **Project Management** - Organize tasks by projects
- 👥 **User Management** - Multi-user support with role-based access
- 🎨 **Modern UI** - Clean and intuitive user interface
- 🔒 **Secure API** - JWT-based authentication and authorization
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

### Frontend
- React 18.2.0
- React Router DOM 6.21.1
- JWT Decode for token management

### Backend
- Node.js with Express
- PostgreSQL database
- JWT authentication
- bcrypt for password hashing
- CORS enabled

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Project-Collabration-App
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Set up the database**
   - Create a PostgreSQL database named `collabrationapp`
   - Run the SQL script to create tables:
     ```bash
     psql -U your_username -d collabrationapp -f server/data.sql
     ```

4. **Configure environment variables**
   
   Create a `.env` file in the `server` directory:
   ```env
   USERNAME=your_db_username
   PASSWORD=your_db_password
   HOST=localhost
   DBPORT=5432
   PORT=8000
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret_key_here
   GOOGLE_CLIENT_ID=your_google_client_id
   ```

   Create a `.env` file in the `client` directory:
   ```env
   REACT_APP_SERVERURL=http://localhost:8000
   REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here
   ```

5. **Set up Google OAuth**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized JavaScript origins: `http://localhost:3000`
   - Add authorized redirect URIs: `http://localhost:3000`
   - Copy the Client ID to your `.env` files

## Running the Application

### Development Mode

**Option 1: Run both server and client together**
```bash
npm run dev
```

**Option 2: Run separately**

Terminal 1 (Server):
```bash
npm run server
```

Terminal 2 (Client):
```bash
npm run client
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with email and password
- `POST /api/auth/google-auth` - Authenticate with Google OAuth

### Tasks
- `GET /api/tasks/:userEmail` - Get all tasks for a user
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

### Projects
- `GET /api/projects/user/:userId` - Get all projects for a user
- `GET /api/projects/:projectId` - Get a single project
- `POST /api/projects` - Create a new project
- `PUT /api/projects/:projectId` - Update a project
- `GET /api/projects/:projectId/tasks` - Get tasks for a project

### Health Check
- `GET /health` - Server health check

## Project Structure

```
Project-Collabration-App/
├── client/                 # React frontend application
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── context/       # React context providers
│   │   ├── pages/         # Page components
│   │   └── App.js         # Main app component
│   └── package.json
├── server/                # Node.js backend application
│   ├── middleware/        # Express middleware
│   ├── routes/            # API route handlers
│   ├── db.js             # Database connection
│   ├── server.js         # Express server setup
│   ├── data.sql          # Database schema
│   └── package.json
└── package.json          # Root package.json
```

## Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- CORS configuration
- Input validation and sanitization
- Protected routes on frontend
- Authorization middleware on backend
- Environment variables for sensitive data

## Database Schema

The application uses PostgreSQL with the following main tables:
- `appUser` - User accounts
- `Project` - Projects
- `Task` - Tasks within projects
- `tasks` - Simple task management (for quick tasks)
- `WorksOn` - User-project relationships
- `ProjectManager` - Project managers
- `Member` - Project members
- `CollaborationRequest` - Collaboration requests
- And more (see `server/data.sql` for full schema)

## Development

### Code Style
- Follow ESLint configuration
- Use meaningful variable names
- Add comments for complex logic
- Keep components small and focused

### Testing
```bash
# Run client tests
cd client
npm test

# Run server tests (if implemented)
cd server
npm test
```

## Deployment

### Production Build

1. **Build the client**
   ```bash
   cd client
   npm run build
   ```

2. **Set environment variables** for production

3. **Start the server**
   ```bash
   cd server
   npm run deploy
   ```

### Environment Variables for Production

Make sure to set:
- Strong `JWT_SECRET`
- Production database credentials
- Production `CLIENT_URL` for CORS
- Production Google OAuth credentials

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database `collabrationapp` exists

### Authentication Issues
- Verify Google OAuth Client ID is correct
- Check that authorized origins match your domain
- Ensure JWT_SECRET is set

### CORS Errors
- Verify `CLIENT_URL` in server `.env` matches your frontend URL
- Check that credentials are enabled in CORS config

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

ISC

## Author

Simon Deng

## Acknowledgments

- Google OAuth for authentication
- React team for the excellent framework
- Express.js for the robust backend framework
