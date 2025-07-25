import axios from 'axios';

/**
 * Sets up global axios response interceptor for handling authentication errors
 * 
 * This interceptor automatically handles:
 * - 401 Unauthorized responses (token expired/invalid)
 * - Automatic logout and redirect to login page
 * - Token cleanup from localStorage
 * 
 * Should be called once when the application starts or when a protected
 * component mounts to ensure all API calls are monitored for auth failures.
 * 
 * Usage:
 * ```javascript
 * import setupAuthInterceptor from '../api/authInterceptor';
 * setupAuthInterceptor(); // Call once in your app
 * ```
 */
const setupAuthInterceptor = () => {
    // Create axios response interceptor
    axios.interceptors.response.use(
        /**
         * Success response handler - pass through successful responses unchanged
         * 
         * @param {Object} response - Axios response object
         * @returns {Object} - Unmodified response object
         */
        (response) => response,

        /**
         * Error response handler - intercept and handle authentication errors
         * 
         * @param {Object} error - Axios error object
         * @returns {Promise} - Rejected promise with the error
         */
        (error) => {
            // Check if the error is a 401 Unauthorized response
            if (error.response?.status === 401) {
                // Token is expired, invalid, or missing on the server
                console.warn('Authentication failed - redirecting to login');

                // Remove the invalid token from localStorage
                localStorage.removeItem('token');

                // Redirect user to login page
                // Using window.location.href for full page reload to ensure
                // all state is cleared and authentication is reset
                window.location.href = '/';
            }

            // For all other errors, pass them through unchanged
            // This allows components to handle other types of API errors normally
            return Promise.reject(error);
        }
    );
};

export default setupAuthInterceptor;