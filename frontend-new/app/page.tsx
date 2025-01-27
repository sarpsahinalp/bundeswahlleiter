import ElectionTimer from "@/components/ElectionTimer"
import LiveAnalysis from "@/components/LiveAnalysis"

export default function Dashboard() {
    return (
        <div className="px-4 py-6 sm:px-0">
            <h2 className="text-2xl font-bold mb-4">Election Dashboard</h2>
            <div className="space-y-8">
                <ElectionTimer />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="bg-white overflow-hidden shadow rounded-lg transition-all duration-300 hover:shadow-xl hover:scale-105">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-lg font-medium">Voter Turnout</h3>
                            <p className="mt-1 text-3xl font-semibold">76.5%</p>
                        </div>
                    </div>
                    <div className="bg-white overflow-hidden shadow rounded-lg transition-all duration-300 hover:shadow-xl hover:scale-105">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-lg font-medium">Registered Voters</h3>
                            <p className="mt-1 text-3xl font-semibold">61.5 million</p>
                        </div>
                    </div>
                </div>

                <LiveAnalysis />
            </div>
        </div>
    )
}

