# ⚒️ GitForge - GitHub Profile Builder

> Generate real open-source projects with AI and fill your GitHub contribution graph with backdated commits. Make your profile stand out to recruiters.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-blue?logo=google)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- 🤖 **AI Code Generation** — Google Gemini generates real, working code for each project
- 📅 **Backdated Commits** — Choose any date range with realistic commit patterns
- 🎯 **Skill-Based Projects** — Get project suggestions matching your tech stack
- 💰 **Cost Estimation** — See token costs before generating
- 📊 **Live Preview** — Preview your contribution graph before & during generation
- 🔒 **Your Keys, Your Data** — Bring your own Gemini API key

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- A [GitHub OAuth App](https://github.com/settings/developers)
- A [Google Gemini API Key](https://aistudio.google.com/apikey)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd github_builder
npm install
```

### 2. Create a GitHub OAuth App

1. Go to **GitHub Settings → Developer Settings → OAuth Apps → New OAuth App**
2. Fill in:
   - **Application name**: GitForge (or anything)
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
3. Copy the **Client ID** and generate a **Client Secret**

### 3. Configure Environment Variables

Edit `.env.local` in the project root:

```env
# Generate a secret: npx auth secret
AUTH_SECRET=your_generated_secret_here

# From your GitHub OAuth App
AUTH_GITHUB_ID=your_client_id_here
AUTH_GITHUB_SECRET=your_client_secret_here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

To generate `AUTH_SECRET`, run:
```bash
npx auth secret
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## 🛠 How It Works

1. **Connect GitHub** — Sign in with GitHub OAuth (requests `repo` + `user` permissions)
2. **Select Skills** — Choose your tech stack (React, Python, Node.js, Go, etc.)
3. **Pick Projects** — Browse AI-suggested projects or add custom ones (max 10)
4. **Review Estimates** — See tokens, cost, commits count & preview contribution graph
5. **Generate & Commit** — AI generates code → pushes backdated commits to your GitHub

### Commit Distribution Algorithm

Commits are spread realistically:
- 70% weekdays, 30% weekends
- 0-8 commits per day with random variation
- ~20% empty days for realistic gaps
- Occasional burst days
- Commits spread across 9 AM - 11 PM

### GitHub Integration

Each project gets its own new repository. Commits are created using GitHub's Git Data API with custom `author.date` and `committer.date` fields.

> **Important**: For green squares to appear on your profile, the commit email must match a verified email on your GitHub account.

## 📁 Project Structure

```
├── app/
│   ├── page.js                    # Landing page
│   ├── globals.css                # Design system
│   ├── layout.js                  # Root layout
│   ├── providers.js               # SessionProvider wrapper
│   ├── dashboard/
│   │   ├── page.js                # Dashboard (server)
│   │   └── DashboardClient.js     # 4-step wizard
│   └── api/
│       ├── auth/[...nextauth]/    # GitHub OAuth
│       ├── validate-key/          # Gemini key validation
│       ├── projects/suggest/      # Project suggestions
│       ├── projects/estimate/     # Token/cost estimation
│       └── generate/              # Generation pipeline (SSE)
├── components/ui/                 # Reusable UI components
├── lib/
│   ├── auth.js                    # NextAuth config
│   ├── github.js                  # GitHub API helpers
│   ├── gemini.js                  # Gemini API integration
│   ├── commit-scheduler.js        # Commit distribution
│   ├── project-templates.js       # 30+ project templates
│   └── token-estimator.js         # Cost estimation
```

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Auth | NextAuth.js v5 (GitHub OAuth) |
| AI | Google Gemini 2.5 Flash |
| Styling | Vanilla CSS (Dark Theme) |
| GitHub API | REST + Git Data API |

## 📝 License

MIT License - use it however you want.

---

Built with ⚒️ and ☕ — *because your GitHub profile deserves to be green* 🟩
