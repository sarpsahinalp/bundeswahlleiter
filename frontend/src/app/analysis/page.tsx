import * as React from 'react';

const voteResults = [
    { party: 'CDU/CSU', votes: 15234567, percentage: 32.5 },
    { party: 'SPD', votes: 12345678, percentage: 26.3 },
    { party: 'Grüne', votes: 8765432, percentage: 18.7 },
    { party: 'FDP', votes: 4567890, percentage: 9.7 },
    { party: 'AfD', votes: 3456789, percentage: 7.4 },
    { party: 'Die Linke', votes: 2345678, percentage: 5.0 },
];

export default function Analysis() {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Bundestagswahl 2025 Analysis</h1>
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Party
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Votes
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Percentage
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {voteResults.map((row) => (
                        <tr key={row.party}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                {row.party}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                {row.votes.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                {row.percentage.toFixed(1)}%
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

