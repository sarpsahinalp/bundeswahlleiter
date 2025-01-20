'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

export default function TokenEntry() {
    const [token, setToken] = React.useState('');
    const router = useRouter();

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        router.push(`/token/voting/${token}`);
    };

    return (
        <div className="max-w-md mx-auto">
            <h1 className="text-3xl font-bold mb-6">Enter Your Voting Token</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="token" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Voting Token
                    </label>
                    <input
                        type="text"
                        id="token"
                        name="token"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Submit
                </button>
            </form>
        </div>
    );
}

