'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';

const parties = [
    { id: 1, name: 'CDU/CSU', logo: '/cdu-logo.png' },
    { id: 2, name: 'SPD', logo: '/spd-logo.png' },
    { id: 3, name: 'Grüne', logo: '/gruene-logo.png' },
    { id: 4, name: 'FDP', logo: '/fdp-logo.png' },
    { id: 5, name: 'AfD', logo: '/afd-logo.png' },
    { id: 6, name: 'Die Linke', logo: '/linke-logo.png' },
];

export default function Voting() {
    const params = useParams();
    const { tokenId } = params;
    const [selectedParty, setSelectedParty] = React.useState<number | null>(null);

    const handleVote = async () => {
        if (selectedParty === null) return;

        try {
            const response = await fetch('/api/vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ tokenId, partyId: selectedParty }),
            });

            if (response.ok) {
                alert('Vote submitted successfully!');
            } else {
                alert('Error submitting vote. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error submitting vote. Please try again.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Voting for Bundestagswahl 2025</h1>
            <p className="text-lg mb-4">Token ID: {tokenId}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {parties.map((party) => (
                    <div
                        key={party.id}
                        className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform transform hover:scale-105 ${
                            selectedParty === party.id ? 'ring-2 ring-indigo-500' : ''
                        }`}
                        onClick={() => setSelectedParty(party.id)}
                    >
                        <img src={party.logo || "/placeholder.svg"} alt={`${party.name} logo`} className="w-full h-32 object-cover" />
                        <div className="p-4">
                            <h2 className="text-xl font-semibold">{party.name}</h2>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-8 text-center">
                <button
                    onClick={handleVote}
                    disabled={selectedParty === null}
                    className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Submit Vote
                </button>
            </div>
        </div>
    );
}

