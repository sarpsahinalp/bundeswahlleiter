"use client"

import Link from "next/link"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function VoteConfirmation() {
    const router = useRouter()

    useEffect(() => {
        // Simulate a delay before redirecting to the live results
        const timer = setTimeout(() => {
            router.push("/vote/live-results")
        }, 5000)

        return () => clearTimeout(timer)
    }, [router])

    return (
        <div className="px-4 py-6 sm:px-0">
            <h2 className="text-2xl font-bold mb-4">Vote Confirmation</h2>
            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 transition-all duration-500 animate-fade-in-down">
                <p className="mb-4">
                    Thank you for casting your vote. Your participation in the democratic process is important.
                </p>
                <p className="mb-4">
                    Your vote has been recorded securely and anonymously. The results will be available after the election closes.
                </p>
                <p className="mb-4">
                    You will be redirected to the live results page in a few seconds. If you are not redirected, please click the
                    button below.
                </p>
                <Link
                    href="/vote/live-results"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-300 inline-block"
                >
                    View Live Results
                </Link>
            </div>
        </div>
    )
}

