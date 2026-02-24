# BrainLeaf

BrainLeaf is an AI-powered SaaS that transforms PRD (Product Requirement
Documents) into structured learning materials:

-   📄 Smart summaries\
-   🧠 Revision sheets\
-   ❓ Auto-generated quizzes

Built with a modern fullstack architecture using React (Vite), Fastify,
and Prisma.

------------------------------------------------------------------------

# 🏗 Tech Stack

## Frontend

-   React
-   Vite
-   TypeScript

## Backend

-   Fastify
-   Prisma ORM
-   PostgreSQL (recommended) or SQLite (dev)

## AI Integration

-   OpenAI API (or compatible LLM provider)

------------------------------------------------------------------------

# 📁 Project Structure

brainleaf/ │ ├── backend/ │ ├── prisma/ │ │ ├── schema.prisma │ │ └──
migrations/ │ ├── src/ │ ├── package.json │ └── .env.example │ ├──
frontend/ │ ├── src/ │ ├── package.json │ └── .env.example │ └──
README.md

------------------------------------------------------------------------

# 🚀 Getting Started

## 1️⃣ Clone the repository

git clone https://github.com/your-username/brainleaf.git cd brainleaf

------------------------------------------------------------------------

# ⚙️ Backend Setup

cd backend npm install

Create environment file:

cp .env.example .env

Fill in:

DATABASE_URL= OPENAI_API_KEY= JWT_SECRET=

Run Prisma:

npx prisma migrate dev npx prisma generate

Start backend:

npm run dev

Backend runs on: http://localhost:3000

------------------------------------------------------------------------

# 💻 Frontend Setup

cd ../frontend npm install

Create environment file:

cp .env.example .env

Fill in:

VITE_API_URL=http://localhost:3000

Start development server:

npm run dev

Frontend runs on: http://localhost:5173

------------------------------------------------------------------------

# 🧠 Features

-   PRD file upload
-   AI-generated summaries
-   Revision sheet generation
-   Quiz generation
-   Structured content output
-   Modular backend architecture
-   Clean React UI with Vite

------------------------------------------------------------------------

# 🔐 Environment Variables

## Backend

  Variable         Description
  ---------------- -------------------------------
  DATABASE_URL     Database connection string
  OPENAI_API_KEY   AI provider API key
  JWT_SECRET       Secret key for authentication

## Frontend

  Variable       Description
  -------------- -----------------
  VITE_API_URL   Backend API URL

------------------------------------------------------------------------

# 📦 Production Build

## Backend

npm run build npm start

## Frontend

npm run build

Deploy the generated dist/ folder.

------------------------------------------------------------------------

# 🛡 Security Notes

-   `.env` files are ignored by Git
-   Never commit API keys
-   Use strong JWT secrets
-   Enable HTTPS in production
-   Use a managed database in production

------------------------------------------------------------------------

# 📌 Roadmap

-   [ ] Authentication system
-   [ ] File storage (S3 / cloud storage)
-   [ ] Stripe subscription integration
-   [ ] Dashboard analytics
-   [ ] Multi-document workspace
-   [ ] Role-based access control

------------------------------------------------------------------------

# 📄 License

MIT License
