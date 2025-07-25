import { useState, useEffect } from 'react';

/**
 * Custom hook to check if backend server is running
 * Makes periodic health checks to the backend
 * 
 * @param {number} checkInterval - How often to check (in milliseconds)
 * @returns {Object} - { isBackendOnline, isChecking }
 */
const useBackendStatus = (checkInterval = 30000) => {
    const [isBackendOnline, setIsBackendOnline] = useState(true); // Start optimistic
    const [isChecking, setIsChecking] = useState(false);

    const checkBackendHealth = async () => {
        setIsChecking(true);

        try {
            // Try to hit a simple endpoint to check if backend is alive
            const response = await fetch('http://localhost:5000/api/test', {
                method: 'GET',
                // Add a timeout to prevent hanging
                signal: AbortSignal.timeout(5000), // 5 second timeout
            });

            setIsBackendOnline(response.ok);
        } catch (error) {
            // Any error means backend is not reachable
            setIsBackendOnline(false);
        } finally {
            setIsChecking(false);
        }
    };

    useEffect(() => {
        // Check immediately on mount
        checkBackendHealth();

        // Set up periodic checking
        const interval = setInterval(checkBackendHealth, checkInterval);

        // Cleanup interval on unmount
        return () => clearInterval(interval);
    }, [checkInterval]);

    return { isBackendOnline, isChecking };
};

export default useBackendStatus;