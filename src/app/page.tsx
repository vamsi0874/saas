

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-gray-50 p-6 flex flex-col items-center relative">
      
     
      <div className="absolute top-4 right-4 bg-white border border-gray-200 shadow-md rounded-md px-4 py-2 text-sm text-gray-700 z-10">
        <p>Test credentials</p>
        <p><strong>Email:</strong> v@gmail.com</p>
        <p><strong>Password:</strong> v@161718</p>
      </div>

      <div className="max-w-4xl text-center space-y-6">
        <h1 className="text-5xl font-bold text-gray-900 leading-tight">
          Understand Any GitHub Repository in Seconds
        </h1>
        <p className="text-lg text-gray-600">
          Our SaaS platform fetches your GitHub repository files and instantly summarizes them using AI.
          Dive deep into complex codebases, onboard faster, and save hours of manual reading.
        </p>

        <div className="mt-8 grid gap-8 md:grid-cols-3 text-left">
          <div className="bg-white shadow-md p-6 rounded-xl hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">🔍 GitHub Summarizer</h3>
            <p className="text-gray-600 text-sm">
              Provide a GitHub repo URL and token — we’ll fetch the code files and generate concise summaries using AI.
            </p>
          </div>

          <div className="bg-white shadow-md p-6 rounded-xl hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">🤖 AI Chatbot</h3>
            <p className="text-gray-600 text-sm">
              Ask questions about the codebase through an intelligent chatbot trained on your repository’s content.
            </p>
          </div>

          <div className="bg-white shadow-md p-6 rounded-xl hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">💳 Stripe Billing</h3>
            <p className="text-gray-600 text-sm">
              Purchase credits through secure Stripe payments to unlock more summaries and enhanced chatbot queries.
            </p>
          </div>
        </div>

        <div className="mt-10">
          <Link
            href="/dashboard"
            className="inline-block bg-black text-white text-sm font-medium px-6 py-3 rounded-lg hover:bg-gray-900 transition"
          >
            Get Started for Free
          </Link>
        </div>

        <p className="text-sm text-gray-500 mt-4">
          No credit card required • Start with free credits
        </p>
      </div>
    </main>
  );
}
