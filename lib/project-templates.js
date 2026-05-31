/**
 * Pre-defined project suggestions organized by skill/technology.
 * Each project includes metadata for UI display and generation estimation.
 *
 * @type {Record<string, Array<{
 *   id: string,
 *   name: string,
 *   description: string,
 *   techStack: string[],
 *   estimatedFiles: number,
 *   estimatedComplexity: 'simple' | 'medium' | 'complex',
 *   icon: string
 * }>>}
 */
export const projectTemplates = {
  react: [
    {
      id: 'react-portfolio',
      name: 'Portfolio Website',
      description: 'A personal portfolio site with project showcase, about section, and contact form',
      techStack: ['React', 'CSS Modules', 'React Router'],
      estimatedFiles: 12,
      estimatedComplexity: 'medium',
      icon: '🎨',
    },
    {
      id: 'react-todo',
      name: 'Todo App',
      description: 'A full-featured task manager with categories, filters, and local storage persistence',
      techStack: ['React', 'CSS'],
      estimatedFiles: 8,
      estimatedComplexity: 'simple',
      icon: '✅',
    },
    {
      id: 'react-weather',
      name: 'Weather Dashboard',
      description: 'Real-time weather dashboard with city search, forecasts, and interactive charts',
      techStack: ['React', 'Chart.js', 'OpenWeather API'],
      estimatedFiles: 10,
      estimatedComplexity: 'medium',
      icon: '🌤️',
    },
    {
      id: 'react-pomodoro',
      name: 'Pomodoro Timer',
      description: 'A productivity timer with work/break sessions, notifications, and session history',
      techStack: ['React', 'CSS'],
      estimatedFiles: 7,
      estimatedComplexity: 'simple',
      icon: '🍅',
    },
    {
      id: 'react-movie',
      name: 'Movie Search App',
      description: 'Browse and search movies with details, ratings, trailers, and a watchlist feature',
      techStack: ['React', 'TMDB API', 'React Router'],
      estimatedFiles: 11,
      estimatedComplexity: 'medium',
      icon: '🎬',
    },
    {
      id: 'react-ecommerce',
      name: 'E-commerce Storefront',
      description: 'A mock e-commerce app with product listings, shopping cart, and checkout flow',
      techStack: ['React', 'Context API', 'CSS'],
      estimatedFiles: 15,
      estimatedComplexity: 'complex',
      icon: '🛒',
    },
    {
      id: 'react-kanban',
      name: 'Kanban Board',
      description: 'Drag-and-drop task management board similar to Trello',
      techStack: ['React', 'react-beautiful-dnd'],
      estimatedFiles: 12,
      estimatedComplexity: 'medium',
      icon: '📋',
    },
    {
      id: 'react-social-network',
      name: 'Full-stack Social Network',
      description: 'A complete social media platform with posts, comments, likes, real-time chat, and user profiles',
      techStack: ['React', 'Redux', 'Socket.io', 'TailwindCSS'],
      estimatedFiles: 65,
      estimatedComplexity: 'very-complex',
      icon: '🌐',
    },
  ],

  python: [
    {
      id: 'python-weather-cli',
      name: 'CLI Weather App',
      description: 'Command-line weather tool that fetches current conditions and forecasts by city',
      techStack: ['Python', 'requests', 'argparse'],
      estimatedFiles: 6,
      estimatedComplexity: 'simple',
      icon: '🌧️',
    },
    {
      id: 'python-url-shortener',
      name: 'URL Shortener',
      description: 'A URL shortening service with Flask backend, analytics, and custom short codes',
      techStack: ['Python', 'Flask', 'SQLite'],
      estimatedFiles: 9,
      estimatedComplexity: 'medium',
      icon: '🔗',
    },
    {
      id: 'python-md-converter',
      name: 'Markdown to HTML Converter',
      description: 'CLI tool that converts Markdown files to styled HTML with syntax highlighting',
      techStack: ['Python', 'markdown', 'pygments'],
      estimatedFiles: 6,
      estimatedComplexity: 'simple',
      icon: '📝',
    },
    {
      id: 'python-password-gen',
      name: 'Password Generator',
      description: 'Secure password generator with strength analysis, custom rules, and CLI interface',
      techStack: ['Python', 'secrets', 'argparse'],
      estimatedFiles: 5,
      estimatedComplexity: 'simple',
      icon: '🔐',
    },
    {
      id: 'python-file-organizer',
      name: 'File Organizer',
      description: 'Automatically organizes files in a directory by type, date, or custom rules',
      techStack: ['Python', 'pathlib', 'watchdog'],
      estimatedFiles: 7,
      estimatedComplexity: 'medium',
      icon: '📂',
    },
    {
      id: 'python-web-scraper',
      name: 'Data Web Scraper',
      description: 'Scrape structured data from websites and export to CSV or JSON',
      techStack: ['Python', 'BeautifulSoup', 'requests'],
      estimatedFiles: 6,
      estimatedComplexity: 'simple',
      icon: '🕷️',
    },
    {
      id: 'python-expense-tracker',
      name: 'CLI Expense Tracker',
      description: 'Command line tool to track daily expenses, categorize them, and generate reports',
      techStack: ['Python', 'sqlite3', 'Click'],
      estimatedFiles: 8,
      estimatedComplexity: 'medium',
      icon: '💰',
    },
  ],

  'node.js': [
    {
      id: 'node-rest-api',
      name: 'REST API Boilerplate',
      description: 'Express.js REST API with JWT auth, validation, error handling, and MongoDB',
      techStack: ['Node.js', 'Express', 'MongoDB', 'JWT'],
      estimatedFiles: 14,
      estimatedComplexity: 'complex',
      icon: '🚀',
    },
    {
      id: 'node-discord-bot',
      name: 'Discord Bot Starter',
      description: 'A Discord bot with slash commands, event handlers, and modular command structure',
      techStack: ['Node.js', 'discord.js'],
      estimatedFiles: 10,
      estimatedComplexity: 'medium',
      icon: '🤖',
    },
    {
      id: 'node-file-upload',
      name: 'File Upload Service',
      description: 'File upload API with image processing, storage management, and download links',
      techStack: ['Node.js', 'Express', 'Multer', 'Sharp'],
      estimatedFiles: 9,
      estimatedComplexity: 'medium',
      icon: '📤',
    },
    {
      id: 'node-chat-server',
      name: 'Chat Server',
      description: 'Real-time chat server with rooms, user presence, and message history',
      techStack: ['Node.js', 'Socket.io', 'Express'],
      estimatedFiles: 10,
      estimatedComplexity: 'medium',
      icon: '💬',
    },
    {
      id: 'node-task-queue',
      name: 'Task Queue',
      description: 'Background job processing system with retries, scheduling, and monitoring',
      techStack: ['Node.js', 'Bull', 'Redis', 'Express'],
      estimatedFiles: 11,
      estimatedComplexity: 'complex',
      icon: '⚡',
    },
    {
      id: 'node-cli-tool',
      name: 'Developer CLI Tool',
      description: 'A global CLI tool for scaffolding projects and automating developer workflows',
      techStack: ['Node.js', 'Commander', 'Inquirer'],
      estimatedFiles: 8,
      estimatedComplexity: 'medium',
      icon: '🛠️',
    },
    {
      id: 'node-graphql-api',
      name: 'GraphQL API Server',
      description: 'A GraphQL backend with queries, mutations, subscriptions, and database integration',
      techStack: ['Node.js', 'Apollo Server', 'GraphQL'],
      estimatedFiles: 12,
      estimatedComplexity: 'complex',
      icon: '🕸️',
    },
    {
      id: 'node-microservices',
      name: 'E-commerce Microservices',
      description: 'A scalable backend using microservices architecture with API Gateway, auth, orders, and inventory services',
      techStack: ['Node.js', 'Express', 'RabbitMQ', 'Docker'],
      estimatedFiles: 80,
      estimatedComplexity: 'very-complex',
      icon: '🏗️',
    },
  ],

  'html-css-js': [
    {
      id: 'html-landing-page',
      name: 'Animated Landing Page',
      description: 'A modern landing page with CSS animations, parallax scrolling, and responsive layout',
      techStack: ['HTML', 'CSS', 'JavaScript'],
      estimatedFiles: 6,
      estimatedComplexity: 'simple',
      icon: '✨',
    },
    {
      id: 'html-quiz-app',
      name: 'Quiz App',
      description: 'Interactive quiz application with scoring, timer, multiple categories, and results',
      techStack: ['HTML', 'CSS', 'JavaScript'],
      estimatedFiles: 7,
      estimatedComplexity: 'simple',
      icon: '❓',
    },
    {
      id: 'html-calculator',
      name: 'Calculator',
      description: 'A scientific calculator with keyboard support, history, and a clean UI',
      techStack: ['HTML', 'CSS', 'JavaScript'],
      estimatedFiles: 5,
      estimatedComplexity: 'simple',
      icon: '🧮',
    },
    {
      id: 'html-digital-clock',
      name: 'Digital Clock',
      description: 'Stylish digital clock with timezone support, alarms, and dark/light themes',
      techStack: ['HTML', 'CSS', 'JavaScript'],
      estimatedFiles: 5,
      estimatedComplexity: 'simple',
      icon: '🕐',
    },
    {
      id: 'html-memory-game',
      name: 'Memory Card Game',
      description: 'A card matching game with difficulty levels, scoring, and smooth flip animations',
      techStack: ['HTML', 'CSS', 'JavaScript'],
      estimatedFiles: 6,
      estimatedComplexity: 'simple',
      icon: '🃏',
    },
    {
      id: 'html-drawing-app',
      name: 'Canvas Drawing App',
      description: 'A simple paint application using HTML5 Canvas with colors and brush sizes',
      techStack: ['HTML', 'CSS', 'Canvas API'],
      estimatedFiles: 5,
      estimatedComplexity: 'medium',
      icon: '🖌️',
    },
    {
      id: 'html-music-player',
      name: 'Custom Music Player',
      description: 'A styled audio player with playlist support, progress bar, and volume controls',
      techStack: ['HTML', 'CSS', 'JavaScript'],
      estimatedFiles: 7,
      estimatedComplexity: 'medium',
      icon: '🎵',
    },
  ],

  typescript: [
    {
      id: 'ts-config-parser',
      name: 'Type-Safe Config Parser',
      description: 'A configuration parser library with schema validation, defaults, and environment variable support',
      techStack: ['TypeScript', 'Zod'],
      estimatedFiles: 9,
      estimatedComplexity: 'medium',
      icon: '⚙️',
    },
    {
      id: 'ts-data-store',
      name: 'Generic Data Store',
      description: 'An in-memory data store with type-safe CRUD operations, indexing, and event emission',
      techStack: ['TypeScript'],
      estimatedFiles: 8,
      estimatedComplexity: 'medium',
      icon: '🗄️',
    },
    {
      id: 'ts-api-client',
      name: 'API Client Library',
      description: 'A type-safe HTTP client with request/response interceptors, retries, and caching',
      techStack: ['TypeScript', 'Axios'],
      estimatedFiles: 10,
      estimatedComplexity: 'complex',
      icon: '📡',
    },
  ],

  go: [
    {
      id: 'go-task-cli',
      name: 'CLI Task Manager',
      description: 'A command-line task manager with file-based persistence, priorities, and due dates',
      techStack: ['Go', 'Cobra'],
      estimatedFiles: 8,
      estimatedComplexity: 'medium',
      icon: '📋',
    },
    {
      id: 'go-http-server',
      name: 'HTTP Server',
      description: 'A lightweight HTTP server with routing, middleware, static file serving, and JSON APIs',
      techStack: ['Go', 'net/http'],
      estimatedFiles: 9,
      estimatedComplexity: 'medium',
      icon: '🌐',
    },
    {
      id: 'go-log-analyzer',
      name: 'Log Analyzer',
      description: 'A CLI tool that parses, filters, and aggregates log files with formatted output',
      techStack: ['Go'],
      estimatedFiles: 7,
      estimatedComplexity: 'medium',
      icon: '📊',
    },
  ],

  java: [
    {
      id: 'java-spring-api',
      name: 'Spring Boot REST API',
      description: 'A RESTful API with Spring Boot, JPA, validation, exception handling, and Swagger docs',
      techStack: ['Java', 'Spring Boot', 'H2', 'Maven'],
      estimatedFiles: 14,
      estimatedComplexity: 'complex',
      icon: '☕',
    },
    {
      id: 'java-student-mgmt',
      name: 'Student Management System',
      description: 'A student CRUD application with search, pagination, and grade tracking',
      techStack: ['Java', 'Spring Boot', 'Thymeleaf', 'H2'],
      estimatedFiles: 12,
      estimatedComplexity: 'complex',
      icon: '🎓',
    },
  ],

  rust: [
    {
      id: 'rust-calculator',
      name: 'CLI Calculator',
      description: 'A command-line calculator with expression parsing, variables, and history',
      techStack: ['Rust'],
      estimatedFiles: 6,
      estimatedComplexity: 'medium',
      icon: '🦀',
    },
    {
      id: 'rust-file-watcher',
      name: 'File Watcher',
      description: 'A file system watcher that executes commands on file changes with filtering and debouncing',
      techStack: ['Rust', 'notify'],
      estimatedFiles: 7,
      estimatedComplexity: 'medium',
      icon: '👁️',
    },
  ],
};

/**
 * Get all available skill categories.
 * @returns {string[]} Array of skill category names
 */
export function getSkillCategories() {
  return Object.keys(projectTemplates);
}

/**
 * Get project suggestions filtered by skills.
 * @param {string[]} skills - Array of skill names to filter by
 * @returns {Array<object>} Filtered project suggestions
 */
export function getProjectsBySkills(skills) {
  if (!skills || skills.length === 0) {
    // Return all projects from all categories
    return Object.values(projectTemplates).flat();
  }

  const normalizedSkills = skills.map((s) => s.toLowerCase().trim());

  return normalizedSkills.reduce((acc, skill) => {
    // Try exact match first, then partial match
    const key = Object.keys(projectTemplates).find(
      (k) => k.toLowerCase() === skill || k.toLowerCase().includes(skill) || skill.includes(k.toLowerCase())
    );

    if (key) {
      acc.push(...projectTemplates[key]);
    }

    return acc;
  }, []);
}
