import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';

export interface WahlkreisInfo {
    id: number,
    name: string,
}

const withAuth = <P extends object>(
    WrappedComponent: React.ComponentType<P>,
): React.FC<P> => {
    const RequiresAuth: React.FC<P> = (props) => {
        const [wahlkreis, setWahlkreis] = useState<WahlkreisInfo | null>(null);
        const [isAuthenticated, setIsAuthenticated] = useState(false);
        const [loading, setLoading] = useState(true);
        const router = useRouter();

        useEffect(() => {
            const checkAuth = async () => {
                try {
                    // Axios automatically throws an error for non-2xx responses.
                    const response = await api.get('/secure/validate-token');

                    // If the request is successful, mark the user as authenticated.
                    setWahlkreis(response.data)
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error('Error during authentication check:', error);
                    router.push('/vote');
                } finally {
                    setLoading(false);
                }
            };

            checkAuth().then(
                () => console.log('Authentication check complete'),
                (error) => console.error('Error during authentication check:', error),
            );
        }, [router]);

        if (loading) {
            return <div>Loading...</div>; // Render a loading indicator while checking
        }

        if (isAuthenticated) {
            return <WrappedComponent {...props} wahlkreisInfo={wahlkreis} />;
        }
    };

    return RequiresAuth;
};

export default withAuth;