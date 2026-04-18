# 🎤💼 Interact.ai: AI-Powered Job Interview Preparation Platform 📊

A job interview preparation platform powered by Vapi AI Voice agents. This project allows users to practice interview scenarios with AI-driven voice assistants and receive instant feedback based on their conversations.

## 🌐 Live Demo

Experience the application live: [Interact.ai Interview Platform](https://interview-platform-sand.vercel.app/)

## 🤖 Introduction

Built with Next.js for the user interface and backend logic, Firebase for authentication and data storage, styled with TailwindCSS and using Vapi's voice agents, Interact.ai helps users prepare for job interviews through AI-assisted mock interviews. The platform offers immediate feedback and provides a seamless experience for interview practice.

## ⚙️ Tech Stack

- **Next.js** - React framework for the frontend and API routes
- **Firebase** - Authentication and database
- **Tailwind CSS** - For styling
- **Vapi AI** - For voice agent integration
- **shadcn/ui** - UI component library
- **Google Gemini** - AI model for generating questions and feedback
- **Zod** - For form validation

## 🔋 Features

👉 **Authentication**: Sign Up and Sign In using password/email authentication handled by Firebase.

👉 **Create Interviews**: Easily generate job interviews with help of Vapi voice assistants and Google Gemini.

👉 **Get feedback from AI**: Take the interview with AI voice agent, and receive instant feedback based on your conversation.

👉 **Modern UI/UX**: A sleek and user-friendly interface designed for a great experience.

👉 **Interview Page**: Conduct AI-driven interviews with real-time feedback and detailed transcripts.

👉 **Dashboard**: Manage and track all your interviews with easy navigation.

👉 **Responsiveness**: Fully responsive design that works seamlessly across devices.

## 📂 Project Structure

```
.
├── README.md
├── app
│   ├── (auth)
│   │   ├── layout.tsx
│   │   ├── sign-in
│   │   │   └── page.tsx
│   │   └── sign-up
│   │       └── page.tsx
│   ├── (root)
│   │   ├── interview
│   │   │   ├── [id]
│   │   │   │   ├── feedback
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── api
│   │   └── vapi
│   │       └── generate
│   │           └── route.ts
│   ├── favicon.ico
│   ├── globals.css
│   └── layout.tsx
├── components
│   ├── Agent.tsx
│   ├── AuthForm.tsx
│   ├── DisplayTechIcons.tsx
│   ├── FormField.tsx
│   ├── InterviewCard.tsx
│   └── ui
│       ├── button.tsx
│       ├── form.tsx
│       ├── input.tsx
│       ├── label.tsx
│       └── sonner.tsx
├── firebase
│   ├── admin.ts
│   └── client.ts
├── lib
│   ├── actions
│   │   ├── auth.action.ts
│   │   └── general.action.ts
│   ├── utils.ts
│   └── vapi.sdk.ts
├── public
│   ├── ai-avatar.png
│   ├── calendar.svg
│   ├── covers
│   │   └── [company images]
│   └── [other assets]
└── types
    ├── index.d.ts
    └── vapi.d.ts
```

## 🤸 Quick Start

Follow these steps to set up the project locally on your machine.

### Prerequisites

Make sure you have the following installed on your machine:

- Git
- Node.js
- npm (Node Package Manager)

### Cloning the Repository

```bash
git clone https://github.com/LankeSathwik7/Interview-Platform.git
cd Interview-Platform
```

### Installation

Install the project dependencies using npm:

```bash
npm install
```

### Set Up Environment Variables

Create a new file named `.env.local` in the root of your project and add the following content:

```
NEXT_PUBLIC_VAPI_WEB_TOKEN=
NEXT_PUBLIC_VAPI_WORKFLOW_ID=

GOOGLE_GENERATIVE_AI_API_KEY=

NEXT_PUBLIC_BASE_URL=

NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

Replace the placeholder values with your actual Firebase and Vapi credentials.

### Running the Project

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the project.

## 🧠 How It Works

1. **User Authentication**: Sign up or sign in to access the platform.
2. **Create Interview**: Select a job role and customize your interview settings.
3. **Take Interview**: Interact with the AI voice agent that asks you relevant interview questions.
4. **Get Feedback**: After completing the interview, receive detailed feedback on your performance.
5. **Review & Improve**: Review your answers and the AI's feedback to improve for future interviews.

## 🔗 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vapi AI Documentation](https://vapi.ai/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

## 🙏 Acknowledgements

This project was built following the JavaScript Mastery YouTube tutorial and repository. Special thanks to:

- [JavaScript Mastery](https://www.youtube.com/@javascriptmastery) for the excellent tutorial and inspiration.
- [Adrian Hajdin](https://github.com/adrianhajdin) for the original code and guidance.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
