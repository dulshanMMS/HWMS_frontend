import axios from 'axios';

// Get credentials from environment variables
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// Cloudinary upload URL
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

/**
 * Upload profile image to Cloudinary
 * @param {File} file - The image file to upload
 * @param {string} userId - The user's ID for organizing uploads
 * @returns {Promise<string>} - The URL of the uploaded image
 */
export const uploadProfileImage = async (file, userId) => {
    console.log('🔍 Cloud Name:', CLOUD_NAME);
    console.log('🔍 Upload Preset:', UPLOAD_PRESET);
    try {
        // Validation
        if (!CLOUD_NAME || !UPLOAD_PRESET) {
            throw new Error('Cloudinary configuration missing. Please check your environment variables.');
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
        }

        // Validate file size (max 10MB for Cloudinary free tier)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
            throw new Error('File too large. Maximum size is 10MB.');
        }

        console.log('Starting Cloudinary upload...');

        // Create form data for upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);
        formData.append('folder', 'profile_photos'); // Organize uploads in folders

        // Create unique public_id
        const timestamp = Date.now();
        const publicId = `profile_${userId}_${timestamp}`;
        formData.append('public_id', publicId);

        // Add tags for organization
        formData.append('tags', 'profile,user_upload');

        // Upload to Cloudinary
        const response = await axios.post(CLOUDINARY_URL, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                );
                console.log(`Upload progress: ${percentCompleted}%`);
            },
        });

        const result = response.data;

        if (result.secure_url) {
            console.log('✅ Upload successful!');
            console.log('Image URL:', result.secure_url);
            console.log('Public ID:', result.public_id);

            return result.secure_url;
        } else {
            throw new Error('Upload failed: No URL returned from Cloudinary');
        }

    } catch (error) {
        console.error('❌ Cloudinary upload error:', error);

        if (error.response?.data?.error) {
            // Cloudinary specific errors
            const cloudinaryError = error.response.data.error;
            throw new Error(`Upload failed: ${cloudinaryError.message || cloudinaryError}`);
        } else if (error.code === 'NETWORK_ERROR') {
            throw new Error('Network error. Please check your internet connection.');
        } else {
            throw new Error(error.message || 'Upload failed. Please try again.');
        }
    }
};

/**
 * Delete image from Cloudinary
 * Note: This requires the public_id, which we can extract from the URL
 * @param {string} imageUrl - The Cloudinary URL of the image to delete
 * @returns {Promise<boolean>} - Success status
 */
export const deleteProfileImage = async (imageUrl) => {
    try {
        if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
            console.log('Not a Cloudinary URL, skipping deletion');
            return false;
        }

        // Extract public_id from Cloudinary URL
        const publicId = extractPublicIdFromUrl(imageUrl);

        if (!publicId) {
            console.log('Could not extract public_id from URL');
            return false;
        }

        console.log('Extracted public_id for deletion:', publicId);

        // Note: For security, image deletion should be done on the backend
        // This is a placeholder - implement backend deletion endpoint
        console.log('⚠️ Note: Image deletion should be implemented on backend for security');
        console.log('Public ID to delete:', publicId);

        // You can implement a backend endpoint like:
        // DELETE /api/cloudinary/delete-image
        // That takes the public_id and deletes it server-side

        return true;

    } catch (error) {
        console.error('Error in deleteProfileImage:', error);
        return false;
    }
};

/**
 * Extract public_id from Cloudinary URL
 * @param {string} url - Cloudinary image URL
 * @returns {string|null} - The public_id or null if extraction fails
 */
const extractPublicIdFromUrl = (url) => {
    try {
        // Example URL: https://res.cloudinary.com/demo/image/upload/v1234567890/profile_photos/profile_user123_1640995200000.jpg

        const urlParts = url.split('/');
        const uploadIndex = urlParts.findIndex(part => part === 'upload');

        if (uploadIndex === -1) {
            return null;
        }

        // Get everything after 'upload' and version (if present)
        let pathParts = urlParts.slice(uploadIndex + 1);

        // Remove version if present (starts with 'v' followed by numbers)
        if (pathParts[0] && /^v\d+$/.test(pathParts[0])) {
            pathParts = pathParts.slice(1);
        }

        // Join the remaining parts and remove file extension
        const publicIdWithExtension = pathParts.join('/');
        const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, '');

        return publicId;
    } catch (error) {
        console.error('Error extracting public_id:', error);
        return null;
    }
};

/**
 * Get optimized image URL with transformations
 * @param {string} imageUrl - Original Cloudinary URL
 * @param {Object} options - Transformation options
 * @returns {string} - Optimized image URL
 */
export const getOptimizedImageUrl = (imageUrl, options = {}) => {
    if (!imageUrl || !imageUrl.includes('cloudinary.com')) {
        return imageUrl;
    }

    const {
        width = 400,
        height = 400,
        crop = 'fill',
        quality = 'auto',
        format = 'auto'
    } = options;

    try {
        // Insert transformation parameters into the URL
        const transformationString = `w_${width},h_${height},c_${crop},q_${quality},f_${format}`;

        // Find the position to insert transformations
        const uploadIndex = imageUrl.indexOf('/upload/');
        if (uploadIndex === -1) {
            return imageUrl;
        }

        // Insert transformation after '/upload/'
        const beforeUpload = imageUrl.substring(0, uploadIndex + 8); // Include '/upload/'
        const afterUpload = imageUrl.substring(uploadIndex + 8);

        return `${beforeUpload}${transformationString}/${afterUpload}`;
    } catch (error) {
        console.error('Error generating optimized URL:', error);
        return imageUrl;
    }
};

/**
 * Check if Cloudinary is properly configured
 * @returns {boolean} - Configuration status
 */
export const isCloudinaryConfigured = () => {
    return !!(CLOUD_NAME && UPLOAD_PRESET);
};

export default {
    uploadProfileImage,
    deleteProfileImage,
    getOptimizedImageUrl,
    isCloudinaryConfigured
};