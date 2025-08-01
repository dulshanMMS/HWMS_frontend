// Enhanced BookingSummaryCard.jsx with robust data validation

import React from "react";
import { FaCar, FaChair, FaCalendarAlt } from "react-icons/fa";

/**
 * Enhanced BookingSummaryCard with robust error handling and data validation
 */
const BookingSummaryCard = ({
  bookingCounts,
  totalBookings,
  loading = false,
}) => {
  // Robust data validation and sanitization
  const validateAndSanitizeBookingData = (bookingCounts, totalBookings) => {
    // Helper function to ensure positive integers
    const ensurePositiveInteger = (value) => {
      const num = parseInt(value);
      return isNaN(num) || num < 0 ? 0 : num;
    };

    // Handle both new and legacy props with validation
    let validatedCounts;

    if (bookingCounts && typeof bookingCounts === 'object') {
      // New format with separated counts - validate each field
      validatedCounts = {
        parkingCount: ensurePositiveInteger(bookingCounts.parkingCount),
        seatCount: ensurePositiveInteger(bookingCounts.seatCount),
        totalCount: ensurePositiveInteger(bookingCounts.totalCount),
      };

      // Validate that totalCount matches sum of parkingCount + seatCount
      const calculatedTotal = validatedCounts.parkingCount + validatedCounts.seatCount;
      if (validatedCounts.totalCount !== calculatedTotal) {
        console.warn('BookingSummaryCard: totalCount mismatch, recalculating');
        validatedCounts.totalCount = calculatedTotal;
      }

    } else if (totalBookings !== undefined && totalBookings !== null) {
      // Legacy format - validate total only
      const validTotal = ensurePositiveInteger(totalBookings);
      validatedCounts = {
        parkingCount: 0,
        seatCount: 0,
        totalCount: validTotal,
      };
    } else {
      // Default fallback for completely invalid data
      console.warn('BookingSummaryCard: Invalid booking data provided, using defaults');
      validatedCounts = {
        parkingCount: 0,
        seatCount: 0,
        totalCount: 0,
      };
    }

    return validatedCounts;
  };

  // Calculate safe percentages with division by zero protection
  const calculateSafePercentage = (numerator, denominator) => {
    // Validate inputs
    const validNumerator = parseInt(numerator) || 0;
    const validDenominator = parseInt(denominator) || 0;

    // Handle division by zero
    if (validDenominator === 0) {
      return 0;
    }

    // Calculate percentage and ensure it's within valid range
    const percentage = Math.round((validNumerator / validDenominator) * 100);
    
    // Clamp percentage between 0 and 100 (safety check)
    return Math.max(0, Math.min(100, percentage));
  };

  // Validate and sanitize the input data
  const counts = validateAndSanitizeBookingData(bookingCounts, totalBookings);

  // Loading state with validation-aware placeholder
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-sm mx-auto md:mx-0">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate safe percentages
  const parkingPercentage = calculateSafePercentage(counts.parkingCount, counts.totalCount);
  const seatPercentage = calculateSafePercentage(counts.seatCount, counts.totalCount);

  // Data integrity check - ensure percentages add up to 100% or less
  const totalPercentage = parkingPercentage + seatPercentage;
  if (totalPercentage > 100 && counts.totalCount > 0) {
    console.warn('BookingSummaryCard: Percentage calculation error detected');
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-sm mx-auto md:mx-0">
      {/* Card title */}
      <div className="flex items-center gap-2 mb-4">
        <FaCalendarAlt className="text-blue-500" />
        <p className="text-lg font-semibold">Your Bookings</p>
      </div>

      {/* Total bookings count with error state handling */}
      <div className="text-center mb-4">
        <p className="text-4xl font-bold text-gray-800">
          {counts.totalCount}
        </p>
        <p className="text-sm text-gray-500">
          Total Bookings
          {/* Show data validation warning if needed (dev mode only) */}
          {process.env.NODE_ENV === 'development' && counts.totalCount === 0 && 
           bookingCounts && (bookingCounts.parkingCount || bookingCounts.seatCount) && (
            <span className="block text-xs text-orange-500 mt-1">
              ⚠ Data validation applied
            </span>
          )}
        </p>
      </div>

      {/* Separator */}
      <div className="border-t border-gray-200 my-4"></div>

      {/* Breakdown by type with enhanced error handling */}
      <div className="space-y-3">
        {/* Parking bookings */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <FaCar className="text-white text-lg" />
            </div>
            <div>
              <p className="font-medium text-gray-800">Parking</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">
              {counts.parkingCount}
            </p>
          </div>
        </div>

        {/* Seat bookings */}
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <FaChair className="text-white text-lg" />
            </div>
            <div>
              <p className="font-medium text-gray-800">Seating</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-600">
              {counts.seatCount}
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced stats with robust percentage calculation */}
      {counts.totalCount > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex justify-between text-xs text-gray-600">
            <span>
              Parking: {parkingPercentage}%
            </span>
            <span>
              Seating: {seatPercentage}%
            </span>
          </div>
          
          {/* Enhanced progress bar with validation */}
          <div className="mt-2 flex rounded-full overflow-hidden h-2">
            <div
              className="bg-blue-500 transition-all duration-300"
              style={{ width: `${parkingPercentage}%` }}
            ></div>
            <div
              className="bg-green-500 transition-all duration-300"
              style={{ width: `${seatPercentage}%` }}
            ></div>
            {/* Show remaining space if percentages don't add to 100% */}
            {totalPercentage < 100 && (
              <div
                className="bg-gray-300"
                style={{ width: `${100 - totalPercentage}%` }}
              ></div>
            )}
          </div>

          {/* Data integrity indicator (dev mode only) */}
          {process.env.NODE_ENV === 'development' && totalPercentage > 100 && (
            <div className="mt-1 text-xs text-red-500">
              ⚠ Percentage calculation error detected
            </div>
          )}
        </div>
      )}

      {/* No data state with helpful message */}
      {counts.totalCount === 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center">
          <div className="text-gray-400 text-3xl mb-2">📊</div>
          <p className="text-sm text-gray-500 font-medium">No bookings yet</p>
          <p className="text-xs text-gray-400 mt-1">Start booking to see your stats!</p>
        </div>
      )}
    </div>
  );
};

export default BookingSummaryCard;