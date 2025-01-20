'use client'

import * as React from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import "./globals.css";

const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Token Entry', path: '/token' },
    { name: 'Analysis', path: '/analysis' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => setMounted(true), []);

    return (
        <html lang="en" suppressHydrationWarning>
        <body className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <div className="min-h-screen flex flex-col">
            <nav className="bg-white dark:bg-gray-800 shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <span className="font-bold text-xl">Bundestagswahl 2025</span>
                        </div>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.path}
                                        className="text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                            {mounted && (theme === 'dark' ? (
                                <Sun className="h-5 w-5" />
                            ) : (
                                <Moon className="h-5 w-5" />
                            ))}
                        </button>
                    </div>
                </div>
            </nav>
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
        </body>
        </html>
    );
}

