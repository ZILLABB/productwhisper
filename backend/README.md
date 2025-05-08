# ProductWhisper Backend

This is the backend API for ProductWhisper, a platform that helps users discover products through sentiment analysis of reviews and discussions from various sources.

## Technology Stack

- **Node.js + Express**: Main API server
- **PostgreSQL**: Database for structured data
- **Redis**: Caching layer
- **JWT**: Authentication
- **Python Flask**: Sentiment analysis microservice

## Project Structure

```
backend/
├── src/
│   ├── config/       # Configuration files
│   ├── controllers/  # Request handlers
│   ├── middleware/   # Express middleware
│   ├── models/       # Database models
│   ├── routes/       # API routes
│   ├── services/     # Business logic
│   ├── utils/        # Utility functions
│   └── index.js      # Entry point
├── python-nlp-service/  # Python sentiment analysis service
└── .env              # Environment variables
```

## Getting Started

### Prerequisites

- Node.js (v14+)
- PostgreSQL
- Redis
- Python (3.7+)

### Installation

1. Clone the repository
2. Install Node.js dependencies:
   ```
   cd backend
   npm install
   ```
3. Install Python dependencies:
   ```
   cd python-nlp-service
   pip install -r requirements.txt
   ```
4. Create a PostgreSQL database:
   ```
   createdb productwhisper
   ```
5. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update the values as needed

### Database Setup

There are two ways to set up the database:

#### Option 1: Using the initialization script

This will create the database and run the schema.sql script:

```bash
npm run db:init
```

#### Option 2: Using migrations (recommended)

This approach uses node-pg-migrate to manage database schema changes:

```bash
# Create the database first
createdb productwhisper

# Run all migrations
npm run migrate:up
```

Migrations provide better version control and allow for incremental schema changes. See the [migrations README](./migrations/README.md) for more details.

### Running the Application

1. Start the Node.js server:
   ```
   npm run dev
   ```
2. Start the Python sentiment analysis service:
   ```
   cd python-nlp-service
   python app.py
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/me` - Get current user info

### Products

- `GET /api/products` - Search products with filters
- `GET /api/products/:id` - Get product details with sentiment analysis
- `GET /api/products/:id/mentions` - Get product mentions/reviews

### Search

- `POST /api/search` - Perform a new product search
- `GET /api/search/recent` - Get recent searches

### User

- `GET /api/user/favorites` - Get user favorites
- `POST /api/user/favorites` - Add product to favorites
- `DELETE /api/user/favorites/:id` - Remove from favorites
- `PUT /api/user/preferences` - Update user preferences

## License

This project is licensed under the MIT License.
