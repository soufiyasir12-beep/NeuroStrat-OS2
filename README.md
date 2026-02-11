# Neurostrat OS

**Neurostrat OS** is a high-end, local-first project management system designed for strategic focus. It combines a Zen To-Do list, a Command Center for communications, and an Infinite Whiteboard into a unified, dark-themed interface.

## Features

### 1. Zen To-Do (Strategic Priorities)
- Minimalist task management.
- Recursive sub-tasks.
- Priority-based sorting and visual indicators.
- Local-first persistence using IndexedDB (Dexie.js).

### 2. Command Center (Email Hub)
- **Inbox**: AI-simulated incoming emails that react to your current tasks (powered by Gemini).
- **Compose**: Real email sending capability integrating with Resend.
- **Secure**: Uses a Next.js API Route (`/api/send`) to handle transmissions securely.

### 3. Infinite Canvas (Whiteboard)
- Full integration of `tldraw` customized with a "Neurostrat" dark theme.
- Optimized UI layout with docked toolbars.

## Tech Stack

- **Frontend**: React 18, Tailwind CSS, Framer Motion.
- **Database**: Dexie.js (IndexedDB wrapper).
- **Canvas**: Tldraw.
- **Backend API**: Next.js App Router (for email services).
- **AI**: Google Gemini Flash (for generating contextual content).

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/soufiyasir12-beep/NeuroStrat-OS.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## License

Private / Personal Use.
