// app/components/MultiDashboard.tsx
'use client';

import * as React from 'react';
import AnalysisDashboard from './AnalysisDashboard';
import OnlineVotingDashboard from './OnlineVotingDashboard';

export default function MultiDashboard() {
    // 'dashboard' or 'online' to decide which view to show
    const [activeTab, setActiveTab] = React.useState<'analysis' | 'online'>('analysis');

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            {/* Top navigation for dashboard tabs */}
            <header className="bg-white dark:bg-gray-800 shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <h1 className="font-bold text-xl">Bundestagswahl 2025</h1>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => setActiveTab('analysis')}
                                className={`px-4 py-2 rounded-md font-medium focus:outline-none ${
                                    activeTab === 'analysis'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                                }`}
                            >
                                Analysis
                            </button>
                            <button
                                onClick={() => setActiveTab('online')}
                                className={`px-4 py-2 rounded-md font-medium focus:outline-none ${
                                    activeTab === 'online'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                                }`}
                            >
                                Online Voting
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {activeTab === 'analysis' ? <AnalysisDashboard /> : <OnlineVotingDashboard />}
            </main>
        </div>
    );
}
