# Customer Requirement Tracker

A web application to track customer requirements for retail stores. Built with Node.js, Express, PostgreSQL, and a modern frontend.

## Features

- 📝 Add and manage customer requirements
- 🏷️ Categorize requirements by type
- 📊 Track status updates (Pending, In Progress, Ordered, etc.)
- 💬 Add comments and media attachments
- 🖼️ Support for images and videos
- 📱 Responsive design with Tailwind CSS
- 🔍 Filter and search requirements
- 📈 Dashboard with status overview

## Tech Stack

- **Frontend**: HTML, CSS (Tailwind), JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Deployment**: Render

## Local Development

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd customer-requirement-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/customer_tracker
   PORT=3000
   NODE_ENV=development
   JWT_SECRET=your-secret-key-here
   ```

4. **Set up PostgreSQL database**
   ```sql
   CREATE DATABASE customer_tracker;
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## Deployment to Render

### Option 1: Automatic Deployment (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Render**
   - Go to [render.com](https://render.com)
   - Sign up/Login with your GitHub account
   - Click "New +" and select "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file

3. **Deploy**
   - Render will create both the PostgreSQL database and web service
   - The database connection string will be automatically configured
   - Your app will be deployed to a public URL

### Option 2: Manual Deployment

1. **Create PostgreSQL Database**
   - Go to Render Dashboard
   - Click "New +" → "PostgreSQL"
   - Choose "Free" plan
   - Name it `customer-tracker-db`
   - Note the connection string

2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Choose "Free" plan
   - Set build command: `npm install`
   - Set start command: `npm start`
   - Add environment variable:
     - Key: `DATABASE_URL`
     - Value: (copy from your PostgreSQL service)

3. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy your app

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `PORT` | Server port (Render sets this automatically) | No |
| `NODE_ENV` | Environment (development/production) | No |
| `JWT_SECRET` | Secret for JWT tokens (future use) | No |

## Database Schema

The application automatically creates the following tables:

### `requirement_types`
- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR, UNIQUE)
- `created_at` (TIMESTAMP)

### `requirements`
- `id` (SERIAL PRIMARY KEY)
- `customer` (VARCHAR)
- `contact` (VARCHAR)
- `details` (TEXT)
- `type` (VARCHAR)
- `status` (VARCHAR)
- `images` (TEXT[])
- `videos` (TEXT[])
- `comments` (JSONB)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- `last_comment_at` (TIMESTAMP)

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/types` - Get all requirement types
- `POST /api/types` - Add new requirement type
- `GET /api/requirements` - Get all requirements
- `POST /api/requirements` - Add new requirement
- `PATCH /api/requirements/:id/status` - Update requirement status
- `PUT /api/requirements/:id` - Update requirement
- `DELETE /api/requirements/:id` - Delete requirement
- `POST /api/requirements/:id/comments` - Add comment to requirement

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify your `DATABASE_URL` is correct
   - Ensure PostgreSQL is running
   - Check if the database exists

2. **Port Already in Use**
   - Change the `PORT` in your `.env` file
   - Kill any processes using the port

3. **Build Failures on Render**
   - Check the build logs in Render dashboard
   - Ensure all dependencies are in `package.json`
   - Verify Node.js version compatibility

### Getting Help

- Check the Render deployment logs
- Verify environment variables are set correctly
- Test the API endpoints using the health check: `/api/health`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
