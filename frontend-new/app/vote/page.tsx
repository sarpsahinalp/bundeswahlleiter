"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/axios"

export default function VoteTokenInput() {
  const [token, setToken] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("") // Clear previous errors

    try {
      const response = await api.post(`/validate-hash-and-issue-token/${encodeURIComponent(token)}`)

      if (response.status === 200) {
        router.push("/vote/token/")
      } else {
        setError("Authentication succeeded but cookie not received")
      }

    } catch (err: any) {
      if (err.response?.data) {
        setError(err.response.data.message || "Invalid token")
      } else {
        setError("Network error - please check your connection")
      }
      console.error("Full error:", err)
    }
  }

  return (
      <div className="px-4 py-6 sm:px-0">
        <h2 className="text-2xl font-bold mb-4">Voting Interface</h2>
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <p className="mb-4">
            To access the voting interface, please enter your unique voting token. This token ensures the security and
            integrity of your vote.
          </p>

          {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="token">
                Voting Token
              </label>
              <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline transition-all duration-300 focus:ring-2 focus:ring-blue-500"
                  id="token"
                  type="text"
                  placeholder="Enter your voting token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-300 transform hover:scale-105"
                  type="submit"
              >
                Access Voting Interface
              </button>
            </div>
          </form>
        </div>
      </div>
  )
}