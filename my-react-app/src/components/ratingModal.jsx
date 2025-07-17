
// import React, { useState } from 'react';
// import { FaStar } from 'react-icons/fa';

// const RatingModal = ({ isOpen, onClose, onSubmit, userId }) => {
//   const [rating, setRating] = useState(0);
//   const [feedback, setFeedback] = useState('');
//   const [isSubmitted, setIsSubmitted] = useState(false);
//   const [errorMessage, setErrorMessage] = useState('');

//   if (!isOpen) return null;

//   const handleSubmit = async () => {
//     if (rating === 0 && !feedback.trim()) {
//       setErrorMessage('Please provide a star rating and feedback text.');
//       return;
//     }
//     if (rating === 0) {
//       setErrorMessage('Please select a star rating.');
//       return;
//     }
//     if (!feedback.trim()) {
//       setErrorMessage('Please provide feedback text.');
//       return;
//     }
//     if (userId) {
//       try {
//         const response = await onSubmit({ userId, bookingType: 'parking', rating, feedback });
//         if (response.ok) {
//           setIsSubmitted(true);
//           setErrorMessage('');
//           setTimeout(() => {
//             setIsSubmitted(false);
//             onClose();
//           }, 2000);
//         } else {
//           throw new Error('Failed to submit rating');
//         }
//       } catch (error) {
//         setErrorMessage('Error submitting rating. Please try again.');
//       }
//     }
//   };

//   if (isSubmitted) {
//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//         <div className="bg-white p-10 rounded-lg shadow-xl text-center w-full max-w-2xl">
//           <h2 className="text-2xl font-bold text-green-600 mb-4">Thank You for Rating Us!</h2>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white p-10 rounded-lg shadow-xl w-full max-w-2xl">
//         <div className="flex justify-between items-center mb-6">
//           <span className="text-gray-500 font-semibold">Type of testimonial</span>
//           <div className="flex gap-2 items-center">
//             <span className="text-sm font-medium text-gray-600">Text</span>
//             <label className="inline-flex items-center cursor-pointer">
//               <input type="checkbox" className="sr-only peer" />
//               <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:left-0.5 after:top-0.5 relative"></div>
//             </label>
//             <span className="text-sm font-medium text-gray-600">Video</span>
//           </div>
//         </div>

//         <div className="mb-6">
//           <label className="block text-gray-800 font-medium mb-2">How many stars would you give me?</label>
//           <div className="flex items-center gap-2">
//             {[1, 2, 3, 4, 5].map((star) => (
//               <FaStar
//                 key={star}
//                 className={`cursor-pointer text-2xl ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
//                 onClick={() => setRating(star)}
//               />
//             ))}
//             {rating === 5 && (
//               <span className="ml-2 bg-yellow-300 text-gray-800 text-sm font-semibold px-3 py-1 rounded">
//                 Excellent
//               </span>
//             )}
//           </div>
//         </div>

//         <div className="mb-6">
//           <label className="block text-xl font-semibold text-gray-900 mb-3">
//             How would you rate your experience with us?
//           </label>
//           <textarea
//             value={feedback}
//             onChange={(e) => setFeedback(e.target.value)}
//             className="w-full p-3 border border-gray-300 rounded-lg"
//             rows="3"
//             placeholder="Share your feedback here..."
//           />
//         </div>

//         {errorMessage && <div className="text-red-500 mb-4">{errorMessage}</div>}

//         <div className="flex justify-end gap-2">
//           <button
//             onClick={handleSubmit}
//             className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded"
//             disabled={!userId}
//           >
//             Next
//           </button>
//           <button
//             onClick={onClose}
//             className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-2 rounded"
//           >
//             Rate Later
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RatingModal;


import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';

const RatingModal = ({ isOpen, onClose, onSubmit, userId }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0 && !feedback.trim()) {
      setErrorMessage('Please provide a star rating and feedback text.');
      return;
    }
    if (rating === 0) {
      setErrorMessage('Please select a star rating.');
      return;
    }
    if (!feedback.trim()) {
      setErrorMessage('Please provide feedback text.');
      return;
    }
    if (userId) {
      try {
        const response = await onSubmit({ userId, bookingType: 'parking', rating, feedback });
        if (response.ok) {
          setIsSubmitted(true);
          setErrorMessage('');
          setTimeout(() => {
            setIsSubmitted(false);
            onClose();
          }, 2000);
        } else {
          throw new Error('Failed to submit rating');
        }
      } catch (error) {
        setErrorMessage('Error submitting rating. Please try again.');
      }
    }
  };

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 opacity-50">
            <img 
              src="/src/assets/your-image.png" 
              alt="Background decoration" 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="relative z-10 p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Thank you</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              The feedback helps us improve, appreciate the time you took to send us the feedback!
            </p>
            <button
              onClick={onClose}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-12 py-4 rounded-xl text-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-50">
          <img 
            src="/src/assets/ratingimage.svg" 
            alt="Background decoration" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="relative z-10 p-12">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Rate your experience</h2>
            
            {/* Star Rating */}
            <div className="mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={`cursor-pointer text-4xl transition-colors ${
                      rating >= star ? 'text-yellow-400' : 'text-gray-300'
                    } hover:text-yellow-400`}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
              
              {/* Rating labels */}
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

            {/* Feedback text area */}
            <div className="mb-6">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none resize-none text-lg"
                rows="4"
                placeholder="Tell us more (optional)"
              />
            </div>

            {errorMessage && (
              <div className="text-red-500 mb-6 text-center font-medium">
                {errorMessage}
              </div>
            )}

            {/* Submit and Not Now buttons */}
            <div className="flex justify-center gap-6">
              <button
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-16 py-5 rounded-xl text-xl transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={!userId}
              >
                Submit your feedback
              </button>
              <button
                onClick={onClose}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-16 py-5 rounded-xl text-xl transition-colors"
              >
                Not Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;

