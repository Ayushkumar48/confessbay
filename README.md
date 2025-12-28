
# ConfessBay

ConfessBay is a real-time social platform designed for sharing anonymous confessions and fostering community interactions. Inspired by social media like Instagram, it allows users to post personal stories, discover others' confessions, and connect through likes, comments, and direct messaging—all while maintaining anonymity.

## Features

- **Anonymous Confessions**: Share personal stories without revealing your identity.
- **Real-Time Interactions**: Instant messaging and notifications powered by WebSockets.
- **User Authentication**: Secure login/signup with OAuth support via Arctic.
- **Media Uploads**: Store images and media on AWS S3.
- **Responsive Design**: Modern UI built with TailwindCSS and Svelte components.
- **Database Management**: PostgreSQL with Drizzle ORM for efficient data handling.
- **Caching**: High-performance caching using Dragonfly.

## Tech Stack

### Frontend
- **SvelteKit**: Full-stack framework for building the app.
- **Svelte 5**: Reactive UI components.
- **TypeScript**: Type-safe development.
- **TailwindCSS**: Utility-first CSS framework.
- **Bits UI**: Accessible UI components.
- **Lucide Icons**: Icon library.
- **Vite**: Fast build tool.

### Backend
- **Express.js**: Server framework.
- **Socket.IO**: Real-time communication via WebSockets.
- **PostgreSQL**: Relational database.
- **Drizzle ORM**: Type-safe database queries.
- **Dragonfly**: In-memory data store for caching.
- **AWS S3**: Cloud storage for media.
- **Arctic**: OAuth authentication.
- **Argon2**: Password hashing.

### Development & Testing
- **Vitest**: Unit testing.
- **Playwright**: End-to-end testing.
- **ESLint & Prettier**: Code linting and formatting.
- **Drizzle Kit**: Database migrations and studio.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/confessbay.git
   cd confessbay
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file with necessary configurations (e.g., database URL, AWS credentials, OAuth keys).

4. Run database migrations:
   ```bash
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. For real-time features, start the WebSocket server (if separate):
   ```bash
   # Assuming ws-server is configured
   cd ws-server
   npm start
   ```

## Usage

- Visit the app at `http://localhost:5173` (default Vite port).
- Sign up or log in to start sharing confessions.
- Explore the feed, like posts, and send messages in real-time.

## Scripts

- `npm run dev`: Start development server.
- `npm run build`: Build for production.
- `npm run preview`: Preview production build.
- `npm run test`: Run all tests.
- `npm run db:studio`: Open Drizzle Studio for database management.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is private and not licensed for public use.
