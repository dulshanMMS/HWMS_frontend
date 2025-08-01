import { useEffect } from 'react';
import setupAuthInterceptor from '../api/authInterceptor';

/**
 * Custom hook for handling JWT token expiration across the application
 * 
 * Features:
 * - Automatically checks token expiration every 5 seconds
 * - Checks token validity on user interactions (click, keypress, scroll)
 * - Redirects to login page when token expires
 * - Clears sensitive component state before redirect
 * - Sets up axios interceptor for handling 401 responses
 * 
 * @param {Function} clearStateCallback - Optional callback to clear component state before redirect
 * 
 * Usage:
 * ```javascript
 * const clearSensitiveData = () => {
 *   setUserData(null);
 *   setBookings([]);
 * };
 * useTokenExpiration(clearSensitiveData);
 * ```
 */
const useTokenExpiration = (clearStateCallback = null) => {
    useEffect(() => {
        // Set up axios interceptor to handle 401 responses globally
        setupAuthInterceptor();

        /**
         * Checks if the current JWT token is valid and not expired
         * 
         * @returns {boolean} - True if token is valid, false if expired/invalid
         */
        const checkTokenExpiry = () => {
            // Get token from localStorage
            const token = localStorage.getItem('token');

            // If no token exists, redirect to login
            if (!token) {
                if (clearStateCallback) clearStateCallback();
                window.location.href = '/';
                return false;
            }

            try {
                // Decode JWT token to get payload (contains expiration time)
                const payload = JSON.parse(atob(token.split('.')[1]));
                const currentTime = Date.now() / 1000; // Convert to seconds

                // Check if token has expired (exp is in seconds since Unix epoch)
                if (payload.exp < currentTime) {
                    // Token expired - clear state and redirect
                    if (clearStateCallback) clearStateCallback();
                    localStorage.removeItem('token');
                    window.location.href = '/';
                    return false;
                }

                // Token is still valid
                return true;
            } catch (error) {
                // Token is malformed or corrupted - treat as expired
                console.error('Token validation error:', error);
                if (clearStateCallback) clearStateCallback();
                localStorage.removeItem('token');
                window.location.href = '/';
                return false;
            }
        };

        // Initial token check when component mounts
        if (!checkTokenExpiry()) return;

        // Set up periodic token checking every 5 seconds (5000ms)
        // This ensures tokens expire within 5 seconds of actual expiration
        const interval = setInterval(checkTokenExpiry, 2000);

        /**
         * Handler for user activity events
         * Checks token validity whenever user interacts with the page
         * This provides more responsive token expiration detection
         */
        const handleUserActivity = () => {
            checkTokenExpiry();
        };

        // Add event listeners for user interactions
        // These ensure immediate token checking on user activity
        window.addEventListener('click', handleUserActivity);
        window.addEventListener('keypress', handleUserActivity);
        window.addEventListener('scroll', handleUserActivity);

        // Cleanup function - remove event listeners and clear interval
        return () => {
            clearInterval(interval);
            window.removeEventListener('click', handleUserActivity);
            window.removeEventListener('keypress', handleUserActivity);
            window.removeEventListener('scroll', handleUserActivity);
        };
    }, [clearStateCallback]); // Re-run effect if clearStateCallback changes
};

export default useTokenExpiration;