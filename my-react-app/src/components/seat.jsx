export default function Seat({ chairId, roomId, bookedChairs, onClick, label }) {
    const isBooked = bookedChairs[chairId];
    let displayLabel = isBooked ? bookedChairs[chairId] : label;
  
    // Truncate the label to 7 characters if longer
    if (displayLabel.length > 7) {
      displayLabel = displayLabel.substring(0, 7);
    }
  
    return (
      <button
        onClick={() => onClick(chairId, roomId)}
        className={`w-14 p-1 rounded-full border-[1px] overflow-hidden text-ellipsis whitespace-nowrap ${
          isBooked
            ? "bg-green-400 border-green-500 text-white"
            : "bg-white border-green-300 text-green-800"
        } hover:bg-green-300 hover:animate-pulse-scale transition-all text-xs font-medium`}
      >
        {displayLabel}
      </button>
    );
  }