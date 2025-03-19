import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CustomDatePicker = ({ selectedDate, onChange }) => {
  return (
    <div className="mb-8"> {/* kalin tibbe 4  yata h3 classname eke mb -2 kalin tibbe */}
      <h3 className="text-lg font-semibold mb-8">Choose Date</h3>
      <DatePicker
        selected={selectedDate}
        onChange={onChange}
        dateFormat="dd/MM/yyyy"
        minDate={new Date()}
        className="w-full  p-2 border rounded "
        inline
        calendarClassName="!bg-white" // Ensures background remains white
        dayClassName={(date) =>
          date.toDateString() === selectedDate.toDateString()
      ? "!bg-green-500 !text-white "
      : "hover:bg-green-200"
        }
      />
    </div>
  );
};

export default CustomDatePicker;