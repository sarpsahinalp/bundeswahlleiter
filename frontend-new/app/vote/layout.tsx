import Link from "next/link"
import { ProgressBar } from "@/components/ProgressBar"

export default function VoteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white">German Election Voting System</h1>
          <nav className="mt-4">
            <ul className="flex space-x-4">
              <li>
                <Link href="/" className="text-white hover:text-blue-200 transition-colors duration-300">
                  Back to Main Site
                </Link>
              </li>
              <li>
                <Link href="/vote" className="text-white hover:text-blue-200 transition-colors duration-300">
                  Vote
                </Link>
              </li>
              <li>
                <Link href="/vote/results" className="text-white hover:text-blue-200 transition-colors duration-300">
                  Results
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <ProgressBar />
          {children}
        </div>
      </main>
    </div>
  )
}

