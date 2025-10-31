# AI Career Coach

An intelligent career development platform that helps professionals build better resumes, create compelling cover letters, and prepare for interviews using AI-powered insights.

## 🚀 Features

- **AI-Powered Resume Builder**: Create professional resumes with smart suggestions
- **Cover Letter Generator**: Generate personalized cover letters for job applications
- **Interview Preparation**: Practice with AI-generated questions and get feedback
- **Industry Insights**: Get market trends and salary data for your field
- **Skill Assessment**: Identify gaps and recommend learning paths
- **Progress Tracking**: Monitor your career development journey
- **Quiz Management**: Create, take, and delete interview preparation quizzes
- **Real-time AI Progress**: Visual feedback during AI content generation

## 🛠️ Tech Stack

### Frontend
- [Next.js 15](https://nextjs.org/) - React framework with App Router
- [React 19](https://reactjs.org/) - UI library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Shadcn UI](https://ui.shadcn.com/) - Reusable component library
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [React Hook Form](https://react-hook-form.com/) - Form validation
- [Zod](https://zod.dev/) - TypeScript-first schema validation
- [Radix UI](https://www.radix-ui.com/) - Accessible component primitives
- [Lucide React](https://lucide.dev/) - Icon library
- [Aceternity UI](https://ui.aceternity.com/) - React components with beautiful animations
- [Sonner](https://sonner.emilkowal.dev/) - Toast notification library
- [React Spinners](https://www.davidhu.io/react-spinners/) - Loading spinner components
- [React Markdown](https://remarkjs.github.io/react-markdown/) - Markdown component for React
- [Recharts](https://recharts.org/) - Charting library built with D3

### Backend
- [Prisma](https://www.prisma.io/) - ORM for database management
- [PostgreSQL](https://www.postgresql.org/) - Relational database
- [Clerk](https://clerk.dev/) - Authentication and user management
- [Google Gemini API](https://ai.google.dev/) - AI-powered content generation
- [Inngest](https://www.inngest.com/) - Background job processing

### Development Tools
- [Turbopack](https://turbo.build/pack) - Fast bundler for Next.js
- [ESLint](https://eslint.org/) - Code linting
- [Prettier](https://prettier.io/) - Code formatting

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/ai-career-coach.git
cd ai-career-coach
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your actual credentials
```

4. Run database migrations:
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🗄️ Database Schema

The application uses PostgreSQL with the following main entities:

- **User**: User profiles and authentication
- **Resume**: User resume content and versions
- **CoverLetter**: Generated cover letters
- **Assessment**: Interview practice sessions and results
- **IndustryInsight**: AI-generated industry data

## 🔧 Environment Variables

Refer to [.env.example](.env.example) for all required environment variables.

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Docker
```bash
# Build the image
docker build -t ai-career-coach .

# Run the container
docker run -p 3000:3000 ai-career-coach
```

## 📚 API Documentation

### User Management
- `GET /api/user` - Get current user profile
- `PUT /api/user` - Update user profile

### Resume
- `GET /api/resume` - Get user's resume
- `POST /api/resume` - Save resume content
- `POST /api/resume/improve` - Improve resume with AI

### Cover Letter
- `GET /api/cover-letter` - List user's cover letters
- `POST /api/cover-letter` - Generate new cover letter
- `GET /api/cover-letter/[id]` - Get specific cover letter
- `DELETE /api/cover-letter/[id]` - Delete specific cover letter

### Interview
- `GET /api/interview` - List interview assessments
- `POST /api/interview` - Generate new interview assessment
- `GET /api/interview/[id]` - Get specific assessment
- `POST /api/interview/[id]/submit` - Submit answers to assessment
- `DELETE /api/interview/[id]` - Delete specific assessment

## 🎨 UI Components

The application uses a custom component library built with:
- [Shadcn UI](https://ui.shadcn.com/) - Base components
- [Radix UI](https://www.radix-ui.com/) - Accessible component primitives
- [Lucide React](https://lucide.dev/) - Icon library
- [Aceternity UI](https://ui.aceternity.com/) - Advanced animated components

### Component List
- Accordion - Collapsible content sections
- Alert Dialog - Interruptive notifications
- Badge - Status indicators
- Button - Interactive elements
- Card - Content containers
- Dialog - Modal windows
- Dropdown Menu - Context menus
- Infinite Moving Cards - Animated card carousels
- Input - Text input fields
- Label - Form labels
- Progress - Progress indicators
- Radio Group - Single selection controls
- Select - Dropdown selection
- Sonner - Toast notifications
- Tabs - Tabbed interfaces
- Text Generate Effect - Animated text effects
- Textarea - Multi-line text inputs

## 🤖 AI Integration

### Google Gemini API
Used for:
- Resume content improvement
- Cover Letter generation
- Interview question generation
- Industry insights analysis

### Prompt Engineering
All AI prompts are carefully crafted to ensure:
- Relevant and accurate responses
- Professional tone and language
- Industry-specific terminology
- Personalization based on user data

## 📈 Performance Optimization

- Server-side rendering for fast initial loads
- Client-side caching for improved UX
- Image optimization with Next.js Image component
- Code splitting for reduced bundle sizes
- Database indexing for fast queries

## 🔒 Security

- Authentication with Clerk
- Protected API routes
- Input validation and sanitization
- Secure environment variable handling
- Rate limiting for API endpoints

## 🧪 Testing

- Unit tests with Jest
- Integration tests with React Testing Library
- End-to-end tests with Cypress
- CI/CD pipeline with GitHub Actions

## 📖 Documentation

- [API Documentation](docs/api.md)
- [Database Schema](docs/database.md)
- [Deployment Guide](docs/deployment.md)
- [Contributing Guidelines](docs/contributing.md)
- [Troubleshooting](docs/troubleshooting.md)