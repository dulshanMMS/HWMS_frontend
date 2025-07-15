import React from "react";
import LeftSidebar from "../components/LeftSidebar";
import DateBookingComponent from "../components/DateBooking";

// Simple page wrapper that combines LeftSidebar + DateBooking component
const DateBooking = () => {
  return (
    <LeftSidebar>
      <DateBookingComponent />
    </LeftSidebar>
  );
};

export default DateBooking;