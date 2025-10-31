# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Delete functionality for interview quizzes
- Progress animation for AI cover letter generation with real-time step indicators
- Spacer gap between cover letters and footer on the cover letter page

### Changed
- Increased quiz question count from 5 to 10 questions in interview preparation
- Updated cover letter generation to remove additionalInfo field that was causing database errors
- Improved conditional footer logic to ensure it's hidden on 404 pages
- Enhanced quiz result display with better text color contrast and visibility

### Fixed
- Resolved "Unknown argument additionalInfo" error in cover letter generation
- Fixed AI generation progress section to properly animate all four steps in real-time
- Corrected quiz completion flow to properly redirect to results page with user and correct answers
- Fixed text color visibility issues in quiz results display

### Security
- Improved input validation for all forms and user data

## [1.0.0] - 2023-06-01

### Added
- Initial release of AI Career Coach
- User authentication with Clerk
- Resume builder with AI-powered suggestions
- Cover letter generator with customization options
- Interview preparation with practice questions
- Industry insights dashboard
- Onboarding flow for new users
- Responsive design for all device sizes
- Dark mode support
- PDF export functionality
- Database schema with Prisma
- API endpoints for all core features
- Comprehensive documentation
- Testing suite with Jest and React Testing Library
- Deployment configurations for Vercel and Docker

### Changed
- Improved UI/UX based on user feedback
- Optimized database queries for better performance
- Enhanced error handling and validation
- Updated dependencies to latest versions

### Fixed
- Resolved hydration errors in React components
- Fixed PDF generation issues with special characters
- Corrected calculation of interview scores
- Addressed security vulnerabilities in dependencies

## [0.5.0] - 2023-05-15

### Added
- Beta release with core functionality
- Basic resume building features
- Simple cover letter generation
- Initial interview preparation module
- User profile management
- Database integration with PostgreSQL

## [0.1.0] - 2023-01-01

### Added
- Project initialization
- Next.js framework setup
- Basic project structure
- Initial component library
- Authentication scaffolding
- Database schema design