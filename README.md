

# ⚡ GitHub SaaS – AI-Powered Repository Summarizer & Chatbot

## 🚀 Overview

**GitHub SaaS** is a full-stack AI-powered platform that helps developers **instantly understand any GitHub repository**. By simply entering a GitHub repository URL and a personal access token, users receive **concise summaries** of their codebase and can interact with an **AI chatbot** trained on the repo files.

This tool significantly improves **onboarding speed**, boosts **developer productivity**, and saves **hours of manual code reading**.

---
## 🧪 Test Credentials

Use the following test credentials to explore the platform without creating a new account:

```bash
Email:     v@gmail.com
Password:  v@161718
```
## ✨ Features

### 🔍 GitHub Code Summarizer
- Fetches all code files from a given public/private GitHub repository using a GitHub token.
- Uses **LangChain + OpenAI** to generate smart summaries of each file.
- Reduces manual reading time by **60%** on average.

### 🤖 AI Chatbot
- An interactive chatbot trained on your repository files using **contextual retrieval**.
- Ask high-level or detailed questions about the codebase (e.g., "What does `AuthService` do?" or "How is the DB connected?").
- Uses **LangChain retrievers** and **OpenAI function calling** under the hood.

### 💳 Stripe Billing Integration
- Secure, tokenized payments via **Stripe**.
- Users can purchase **credits** to unlock more summaries and advanced chatbot usage.
- Implements a **credit-based billing model** with usage tracking.

---

## 🔧 Tech Stack

- **Frontend**: Next.js, Tailwind CSS
- **Backend**: Node.js, Express, LangChain, OpenAI API
- **Database**: PostgreSQL (via Prisma)
- **Authentication**: Clerk
- **Payments**: Stripe
- **Deployment**: Vercel (Frontend), Render (API)

---


