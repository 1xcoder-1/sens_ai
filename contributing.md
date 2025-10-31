# Contributing Guidelines

Thank you for your interest in contributing to AI Career Coach! We welcome contributions from the community to help improve the project.

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md) to ensure a welcoming environment for all contributors.

## Getting Started

1. Fork the repository
2. Clone your forked repository
3. Create a new branch for your feature or bug fix
4. Make your changes
5. Write tests if applicable
6. Commit your changes
7. Push to your fork
8. Create a pull request

## Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database
- Clerk account for authentication
- Google Gemini API key

### Installation

```bash
git clone https://github.com/your-username/ai-career-coach.git
cd ai-career-coach
npm install
```

### Environment Setup

Copy the example environment file and configure your variables:

```bash
cp .env.example .env.local
```

Update the values in `.env.local` with your actual credentials.

### Database Setup

```bash
npx prisma migrate dev
```

### Running the Application

```bash
npm run dev
```

## Code Standards

### JavaScript/TypeScript Style

We follow the Airbnb JavaScript style guide with some modifications:

1. Use `const` and `let` instead of `var`
2. Use arrow functions when appropriate
3. Use template literals for string concatenation
4. Use destructuring when possible
5. Use async/await instead of callbacks

### React Components

1. Use functional components with hooks
2. Use TypeScript for type safety
3. Follow the component structure:
   ```javascript
   // Import statements
   import React from 'react';
   
   // Component definition
   const ComponentName = ({ prop1, prop2 }) => {
     // Component logic
     return (
       // JSX
     );
   };
   
   // Export
   export default ComponentName;
   ```

### CSS/Tailwind

1. Use Tailwind CSS utility classes
2. Create reusable components for complex styling
3. Follow mobile-first responsive design principles

## Git Workflow

### Branch Naming

Use descriptive branch names:
- `feature/user-authentication`
- `bugfix/login-error`
- `hotfix/critical-security-issue`
- `docs/update-readme`

### Commit Messages

Follow the conventional commit format:
```
type(scope): description

[body]

[footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions or updates
- `chore`: Maintenance tasks

Examples:
```
feat(auth): add Google sign-in option

Implement Google OAuth authentication using Clerk
```

```
fix(resume): resolve PDF generation issue

Fix the issue where generated PDFs were blank by updating the html2pdf library configuration
```

### Pull Requests

1. Create a pull request for every feature or bug fix
2. Provide a clear description of the changes
3. Link to related issues
4. Request review from team members
5. Address feedback promptly

## Testing

### Unit Tests

Write unit tests for utility functions and helper methods:

```javascript
// Example test
import { formatSalary } from '../utils/formatters';

describe('formatSalary', () => {
  it('should format salary correctly', () => {
    expect(formatSalary(100000)).toBe('$100,000');
  });
});
```

### Component Tests

Test React components using React Testing Library:

```javascript
import { render, screen } from '@testing-library/react';
import Button from './Button';

test('renders button with correct text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

### Integration Tests

Test API endpoints and database interactions:

```javascript
// Example integration test
import { GET } from '../app/api/user/route';
import { createMockContext } from '../__mocks__/context';

describe('GET /api/user', () => {
  it('should return user data', async () => {
    const ctx = createMockContext();
    const response = await GET(null, ctx);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('id');
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- user.test.js

# Run tests with coverage
npm test -- --coverage
```

## Documentation

### Code Comments

1. Comment complex logic
2. Explain why decisions were made
3. Document function parameters and return values

```javascript
/**
 * Calculate years of experience from start date
 * @param {Date} startDate - Employment start date
 * @returns {number} Years of experience
 */
const calculateExperience = (startDate) => {
  // Implementation
};
```

### README Updates

Update the README.md file when:
- Adding new features
- Changing installation process
- Updating dependencies
- Modifying environment variables

### API Documentation

Update API documentation in `docs/api.md` when:
- Adding new endpoints
- Modifying existing endpoints
- Changing request/response formats

## Reporting Issues

### Bug Reports

When reporting bugs, include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Screenshots if applicable
5. Environment information (OS, browser, etc.)

### Feature Requests

When requesting features, include:
1. Description of the feature
2. Use case or problem it solves
3. Potential implementation approach
4. Benefits to users

## Code Review Process

All pull requests must be reviewed by at least one team member before merging. Reviewers should check:

1. Code quality and style
2. Test coverage
3. Documentation updates
4. Security considerations
5. Performance implications

## Recognition

Contributors will be recognized in:
- Release notes
- Contributor list
- Social media announcements

## Questions?

If you have any questions about contributing, feel free to:
- Open an issue
- Join our Discord community
- Email the maintainers at contribute@aicareercoach.com

Thank you for helping make AI Career Coach better!