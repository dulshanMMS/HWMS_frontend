import React, { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import api from '../config/api';

const RatingModal = ({ isOpen, onClose, onSubmit, userId, bookingType }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [scrollPosition, setScrollPosition] = useState(0);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');
  const [shouldShowModal, setShouldShowModal] = useState(false);

  // Static team color mapping (fallback if teamColor is missing)
  const teamColorMap = {
    Engineering: 'bg-blue-500',
    Design: 'bg-indigo-500',
    Marketing: 'bg-teal-500',
    Operations: 'bg-orange-500',
    HR: 'bg-red-500',
    Product: 'bg-purple-500',
    Analytics: 'bg-pink-500',
    Sales: 'bg-yellow-500',
  };

  // Check if user has previously submitted feedback
  useEffect(() => {
    const checkUserFeedback = async () => {
      if (!isOpen || !userId) {
        setShouldShowModal(false);
        return;
      }

      try {
        // Query feedback for the specific user
        const response = await api.get(`/api/ratings/feedback?userId=${userId}`);
        const userFeedbacks = response.data.filter(f => f.userId?._id === userId);
        if (userFeedbacks.length > 0) {
          // User has submitted feedback before, so don't show modal
          setShouldShowModal(false);
          onClose();
        } else {
          // No prior feedback, allow modal to show
          setShouldShowModal(true);
        }
      } catch (error) {
        console.error('Error checking user feedback:', error);
        // Fallback: allow modal to show if backend check fails
        setShouldShowModal(true);
      }
    };

    checkUserFeedback();
  }, [isOpen, userId, onClose]);

  // Reset fields and fetch data when modal opens
  useEffect(() => {
    if (isOpen && shouldShowModal) {
      setRating(0);
      setFeedback('');
      setErrorMessage('');
      setIsSubmitted(false);
      setScrollPosition(0);
      setFeedbackError('');
      fetchFeedbacks();
    }
  }, [isOpen, shouldShowModal]);

  // Fetch feedbacks from the database
  const fetchFeedbacks = async () => {
    try {
      setLoadingFeedbacks(true);
      const response = await api.get('/api/ratings/feedback');
      console.log('Feedbacks fetched:', response.data); // Debug log
      setFeedbacks(response.data);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      setFeedbackError('Failed to load feedback. Please try again later.');
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  // Get team color for a feedback
  const getTeamColor = (userId) => {
    console.log('Getting team color for userId:', userId); // Debug log
    if (!userId || !userId.teamId) {
      console.log('No teamId provided, using default color');
      return 'bg-gray-500';
    }
    const color = userId.teamColor || teamColorMap[userId.teamId] || 'bg-gray-500';
    console.log('Team color selected:', color, 'for teamId:', userId.teamId);
    return color;
  };

  // Auto-scroll animation
  useEffect(() => {
    if (!isOpen || !shouldShowModal || isSubmitted || loadingFeedbacks || feedbackError) return;

    const scrollContainer = document.getElementById('feedback-scroll-container');
    if (!scrollContainer) return;

    let animationId;
    const scroll = () => {
      setScrollPosition((prev) => {
        const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
        const newPosition = prev + 2;

        if (newPosition >= maxScroll) {
          return 0; // Reset to top
        }
        return newPosition;
      });
      animationId = requestAnimationFrame(scroll);
    };

    const timer = setTimeout(() => {
      animationId = requestAnimationFrame(scroll);
    }, 10); // Start after 1 second

    return () => {
      clearTimeout(timer);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isOpen, isSubmitted, loadingFeedbacks, feedbackError, shouldShowModal]);

  // Update scroll position
  useEffect(() => {
    const scrollContainer = document.getElementById('feedback-scroll-container');
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollPosition;
    }
  }, [scrollPosition]);

  if (!isOpen || !shouldShowModal) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      setErrorMessage('Please select a star rating.');
      return;
    }
    if (!feedback.trim()) {
      setErrorMessage('Please provide feedback text.');
      return;
    }
    if (!userId) {
      setErrorMessage('User not authenticated.');
      return;
    }
    try {
      const response = await onSubmit({ userId, bookingType, rating, feedback });
      if (!response) {
        console.error('No response received from onSubmit');
        throw new Error('No response from server');
      }
      const responseData = await response.json();
      console.log('Submit rating response:', response.status, responseData);
      if (response.status === 201) {
        setIsSubmitted(true);
        setErrorMessage('');
      } else {
        console.error('Submit rating failed:', responseData);
        throw new Error(responseData.error || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error.message, error);
      setErrorMessage(`Error submitting rating: ${error.message}. Please try again.`);
    }
  };

  const renderStars = (starRating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar
        key={index}
        className={`text-sm ${index < starRating ? 'text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-auto relative overflow-hidden">
          <div className="relative p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank you</h2>
            <p className="text-gray-600 mb-6">
              Your feedback helps us improve. Thank you for taking the time to share!
            </p>
            <button
              onClick={onClose}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-2 rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors z-10"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex h-full">
          {/* Left Side - Rating Form */}
          <div className="w-1/2 p-8 flex items-center justify-center">
            <div className="w-full max-w-lg">
              <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Rate your experience</h2>
                
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-700 mb-4 text-center">
                    How was your experience? Give us some stars! ⭐
                  </h3>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className={`cursor-pointer text-3xl transition-colors ${
                          rating >= star ? 'text-yellow-400' : 'text-gray-300'
                        } hover:text-yellow-400`}
                        onClick={() => setRating(star)}
                      />
                    ))}
                  </div>
                  <div className="flex justify-center">
                    {rating > 0 && (
                      <span className="text-lg font-medium text-gray-700">
                        {rating === 1 && 'Poor'}
                        {rating === 2 && 'Fair'}
                        {rating === 3 && 'Good'}
                        {rating === 4 && 'Very Good'}
                        {rating === 5 && 'Excellent'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none resize-none"
                    rows="4"
                    placeholder="Share your feedback here..."
                  />
                </div>

                {errorMessage && (
                  <div className="text-red-500 mb-4 text-center font-medium">
                    {errorMessage}
                  </div>
                )}

                <div className="flex justify-center gap-4">
                  <button
                    onClick={handleSubmit}
                    className="bg-green-800 hover:bg-green-900 text-white font-semibold px-6 py-2 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={!userId || rating === 0 || !feedback.trim()}
                  >
                    Submit Feedback
                  </button>
                  <button
                    onClick={onClose}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-6 py-2 rounded-lg transition-colors"
                  >
                    Not Now
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Database Feedbacks */}
          <div className="w-1/2 bg-gray-50 p-8 border-l border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              What Others Say About Us
            </h3>
            
            <div id="feedback-scroll-container" className="h-full overflow-y-auto pr-2 scrollbar-hide" style={{ maxHeight: 'calc(100vh - 200px)', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {loadingFeedbacks ? (
                <div className="text-center py-8 text-gray-500">Loading feedback...</div>
              ) : feedbackError ? (
                <div className="text-center py-8 text-red-500">{feedbackError}</div>
              ) : feedbacks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No feedback available.</div>
              ) : (
                <div className="space-y-4">
                  {feedbacks.map((feedback, index) => (
                    <div key={feedback._id || `feedback-${index}`} className="bg-green-50 rounded-xl p-6 shadow-lg border border-green-100">
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 ${getTeamColor(feedback.userId)} rounded-full flex items-center justify-center flex-shrink-0`}>
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900 text-sm">
                                {feedback.userId?.fullName || feedback.userId?.username || 'Anonymous'}
                              </h4>
                              <p className="text-gray-600 text-xs">
                                {feedback.bookingType === 'seating' ? 'Seating' : 'Parking'}
                              </p>
                            </div>
                            <div className="flex items-center space-x-1">
                              {renderStars(feedback.rating)}
                            </div>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {feedback.feedback?.length > 100
                              ? `${feedback.feedback.substring(0, 100)}...`
                              : feedback.feedback || 'No comment provided'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;