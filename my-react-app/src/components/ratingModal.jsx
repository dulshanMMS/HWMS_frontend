import React, { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';

const RatingModal = ({ isOpen, onClose, onSubmit, userId }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [scrollPosition, setScrollPosition] = useState(0);

  // Hardcoded employee feedbacks
  const employeeFeedbacks = [
    {
      id: 1,
      name: "Priya Sharma",
      role: "Product Manager",
      rating: 5,
      text: "Exceptional service and user-friendly design! Highly recommended.",
      avatarColor: "bg-purple-500"
    },
    {
      id: 2,
      name: "James Wilson",
      role: "Software Developer",
      rating: 5,
      text: "Impressive functionality and excellent customer support!",
      avatarColor: "bg-blue-500"
    },
    {
      id: 3,
      name: "Nisha Gupta",
      role: "Data Analyst",
      rating: 3,
      text: "Decent features, but the lack of customization options is disappointing.",
      avatarColor: "bg-pink-500"
    },
    {
      id: 4,
      name: "Michael Chen",
      role: "UI/UX Designer",
      rating: 4,
      text: "Great interface design and smooth user experience. Could use more advanced features.",
      avatarColor: "bg-indigo-500"
    },
    {
      id: 5,
      name: "Sarah Johnson",
      role: "Marketing Manager",
      rating: 5,
      text: "Outstanding platform! Easy to use and very efficient for our daily operations.",
      avatarColor: "bg-teal-500"
    },
    {
      id: 6,
      name: "David Rodriguez",
      role: "Operations Lead",
      rating: 4,
      text: "Solid performance and reliable service. Minor room for improvement in loading times.",
      avatarColor: "bg-orange-500"
    },
    {
      id: 7,
      name: "Emily Chen",
      role: "HR Manager",
      rating: 5,
      text: "Streamlined our entire workflow. The team loves using this platform daily.",
      avatarColor: "bg-red-500"
    },
    {
      id: 8,
      name: "Alex Kumar",
      role: "Business Analyst",
      rating: 4,
      text: "Good value for money. The reporting features are particularly useful.",
      avatarColor: "bg-yellow-500"
    }
  ];

  // Reset fields when modal opens
  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setFeedback('');
      setErrorMessage('');
      setIsSubmitted(false);
      setScrollPosition(0);
    }
  }, [isOpen]);

  // Auto-scroll animation
  useEffect(() => {
    if (!isOpen || isSubmitted) return;

    const scrollContainer = document.getElementById('feedback-scroll-container');
    if (!scrollContainer) return;

    let animationId;
    const scroll = () => {
      setScrollPosition((prev) => {
        const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
        const newPosition = prev + 4;
        
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
  }, [isOpen, isSubmitted]);

  // Update scroll position
  useEffect(() => {
    const scrollContainer = document.getElementById('feedback-scroll-container');
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollPosition;
    }
  }, [scrollPosition]);

  if (!isOpen) return null;

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
      const response = await onSubmit({ userId, bookingType: 'parking', rating, feedback });
      if (!response) {
        console.error('No response received from onSubmit');
        throw new Error('No response from server');
      }
      const responseData = await response.json();
      console.log('Submit rating response:', response.status, responseData);
      if (response.status === 201) {
        setIsSubmitted(true);
        setErrorMessage('');
        setTimeout(() => {
          setIsSubmitted(false);
          onClose();
        }, 2000);
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

          {/* Right Side - Employee Feedbacks */}
          <div className="w-1/2 bg-gray-50 p-8 border-l border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
               What Others Say About Us
            </h3>
            
            <div id="feedback-scroll-container" className="h-full overflow-y-auto pr-2 scrollbar-hide" style={{ maxHeight: 'calc(100vh - 200px)', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <div className="space-y-4">
                {employeeFeedbacks.map((feedback) => (
                  <div key={feedback.id} className="bg-green-50 rounded-xl p-6 shadow-lg border border-green-100">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 ${feedback.avatarColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm">
                              {feedback.name}
                            </h4>
                            <p className="text-gray-600 text-xs">
                              {feedback.role}
                            </p>
                          </div>
                          <div className="flex items-center space-x-1">
                            {renderStars(feedback.rating)}
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {feedback.text}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;