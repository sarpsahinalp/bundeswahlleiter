"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import withAuth from "@/lib/RequiresAuth";

function VoteConfirmation() {
    const router = useRouter()

    useEffect(() => {
        const timer = setTimeout(() => {
            router.push("/vote")
        }, 5000)

        return () => clearTimeout(timer)
    }, [router])

    return (
        <div className="px-4 py-6 sm:px-0">
            <div className="max-w-lg mx-auto">
                <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 transition-all duration-500 animate-fade-in-down">
                    <div className="text-center">
                        <div className="mb-4">
                            <svg
                                className="mx-auto h-12 w-12 text-green-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold mb-4">Vote Confirmation</h2>
                        <p className="mb-4">
                            Thank you for casting your vote. Your participation in the democratic process is important.
                        </p>
                        <p className="mb-4">Your vote has been recorded securely and anonymously.</p>
                        <p className="text-sm text-gray-500">Redirecting back to voting page...</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VoteConfirmation;