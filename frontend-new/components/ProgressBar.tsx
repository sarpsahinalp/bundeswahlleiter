'use client'

import { usePathname } from "next/navigation"
import { motion } from "framer-motion"

const steps = [
    { name: "Token Input", href: "/vote" },
    { name: "Voting", href: "/vote/token" },
    { name: "Confirmation", href: "/vote/confirmation" },
]

export function ProgressBar() {
    const pathname = usePathname()
    const currentStepIndex = steps.findIndex((step) => step.href === pathname)

    return (
        <div className="w-full py-8 px-4">
            <div className="relative">
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                    <motion.div
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-500 to-indigo-600"
                        initial={{ width: "0%" }}
                        animate={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                    />
                </div>
                <div className="flex justify-between">
                    {steps.map((step, index) => (
                        <div key={step.name} className="text-center">
                            <motion.div
                                className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center border-2 ${
                                    index < currentStepIndex
                                        ? "border-indigo-600 bg-indigo-600"
                                        : index === currentStepIndex
                                            ? "border-indigo-600 bg-indigo-600"
                                            : "border-blue-200"
                                }`}
                                initial={{ scale: 1 }}
                                animate={{ scale: index === currentStepIndex ? 1.2 : 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                {index < currentStepIndex ? (
                                    <svg
                                        className="w-6 h-6 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                ) : index === currentStepIndex ? (
                                    <span className="w-4 h-4 bg-white rounded-full"></span>
                                ) : (
                                    <span className="text-blue-200">{index + 1}</span>
                                )}
                            </motion.div>
                            <div className="text-xs font-medium mt-2 text-gray-600">{step.name}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

