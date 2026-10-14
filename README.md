# EduBridge AI — Your Personal AI Learning Companion

EduBridge AI is a student-focused hackathon MVP built with React, TypeScript, Tailwind CSS, and Google Gemini. It bridges the gap between ambitious academic goals and daily execution by diagnosing subject vulnerabilities from self-assessments, generating adaptive 7-day study plans, providing verified learning resources, and delivering real-time tutoring with an AI Learning Coach.

---

## 🏗️ Architecture: Decoupled Frontend & Backend

The repository is organized into distinct frontend and backend layers coordinated via a root workspace:

```text
hack2skill/
├── frontend/                      # Client UI application (React 18 + Vite + Tailwind)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts             # Vite dev server + dev middleware for /api/generate
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── tsconfig.json
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── components/            # UI components (Navbar, Dashboard, Planner, Gaps, Resources, Coach, Modal)
│       ├── services/
│       │   └── apiClient.ts       # Centralized client calling /api/generate
│       ├── data/
│       │   └── sampleData.ts      # Demo student seed data for judges
│       ├── types/
│       │   └── index.ts           # UI TypeScript contracts
│       ├── utils/
│       │   └── storage.ts         # LocalStorage persistence & reset logic
│       └── index.css
│
├── backend/                       # Server-side business logic & AI integration
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── routes/
│       │   └── generate.ts        # POST /api/generate route dispatcher
│       ├── controllers/
│       │   └── generateController.ts # Input validation, size limiter & execution
│       ├── services/
│       │   └── geminiService.ts   # Official @google/genai SDK + offline engine
│       ├── types/
│       │   └── index.ts           # Server-side request/response and domain types
│       └── data/
│           └── fallbackData.ts    # Deterministic fallback responses
│
├── api/                           # Vercel Serverless Function entrypoint
│   └── generate.ts                # Serverless adapter invoking backend/src/routes/generate
│
├── package.json                   # Root orchestrator & npm workspaces
├── package-lock.json              # Unified lockfile
├── vercel.json                    # Vercel deployment routing (output: frontend/dist)
├── tsconfig.json                  # Root TypeScript configuration
├── .env.example
├── .gitignore
└── README.md
```

---

## 🚀 Key Features

1. **Usable Dashboard Immediately**
   - Shows greeting, daily study target in hours, interactive checklist progress, identified critical skill gaps, and active study streak.
   - No generic landing page barriers — students jump directly into productive study planning.

2. **Skill-Gap Analysis**
   - Evaluates student self-ratings (1–5 scale).
   - Identifies high-risk subjects and explains root causes (exam weightage, prerequisite conceptual bottlenecks).
   - Calculates recommended weekly study hours and pinpoints high-yield topics to focus on.
   - Interactive re-analysis powered by Google Gemini.

3. **7-Day Adaptive AI Study Planner**
   - Generates realistic, actionable study sessions distributed across 7 days.
   - Allocates 60–70% of available study time to weaker subjects.
   - Every task includes subject, topic, duration, priority, and concrete learning activity (e.g., *"Solve 10 problems on induced EMF and sketch graphs"*).
   - Interactive checkboxes with completion tracking and celebratory confetti animations.
   - Ability to add custom study tasks.

4. **Curated High-Yield Learning Resources**
   - Subject-specific practice problems, video lectures, formula sheets, and interactive simulations.
   - Uses genuine search queries targeting verified educational platforms (Khan Academy, YouTube, Google Search).
   - Never fabricates unverified URLs.

5. **AI Learning Coach (Tutor)**
   - Conversational academic mentor powered by Gemini.
   - Explains tricky concepts in intuitive student-friendly analogies, breaks down formulas, and provides time-management tips.
   - Features quick-prompt chips (*"Explain Lenz's Law"*, *"Demystify Aldol Condensation"*, *"Master Integration by Parts"*).

6. **Sample Student Mode for Judges**
   - Pre-populated with realistic student profile (*Aarav Sharma — Class 12 STEM Finals*).
   - One-click reset to evaluate the end-to-end workflow instantly without lengthy setup.

7. **Dual-Mode Intelligence (Live Gemini + Offline Deterministic Engine)**
   - If `GEMINI_API_KEY` is configured, utilizes Google Gemini 3.8 Flash.
   - If offline or API key is not yet configured, cleanly operates in **Offline Intelligence Mode** with deterministic diagnostics and fallbacks, clearly labeled with an engine status badge.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React icons, Canvas Confetti
- **Backend**: TypeScript, Node.js, `@google/genai` (Google Gen AI official JavaScript SDK)
- **Model**: `gemini-3.8-flash`
- **Serverless**: Vercel Serverless Function at `/api/generate` with built-in Vite development middleware
- **Storage**: Browser LocalStorage for persistent profiles, task completions, and chat history

---

## ⚙️ Local Development Setup

### Prerequisites
- Node.js v18+ (tested on Node v24.19)
- npm v9+

### 1. Clone & Install
```bash
git clone https://github.com/syedtanisha/hack2skill.git
cd hack2skill
npm install
```

### 2. Configure Environment Variables (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your Google Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
*(Note: If no API key is supplied, EduBridge AI automatically runs in Deterministic Offline Demo Mode so all features remain functional for judges and testing.)*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser. The Vite dev server will automatically proxy `/api/generate` requests directly to `backend/src/routes/generate.ts`.

### 4. Build for Production
```bash
npm run build
```
This runs type-checking and bundling across both `@edubridge/backend` and `@edubridge/frontend`, outputting production static assets to `frontend/dist`.

---

## 🌐 Deploy to Vercel

1. Push this repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. In Vercel Project Settings > **Environment Variables**, add:
   - `GEMINI_API_KEY`: Your Gemini API key from [Google AI Studio](https://aistudio.google.com/)
4. Deploy! The `vercel.json` (`outputDirectory: "frontend/dist"`) and `api/generate.ts` endpoints will automatically configure the serverless AI backend and static frontend bundle.

---

## 📄 License
MIT License. Built for the Google Antigravity Hackathon 2026.
