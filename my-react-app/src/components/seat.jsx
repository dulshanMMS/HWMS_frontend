export default function Seat({ chairId, roomId, bookedChairs, onClick, label }) {
    const isBooked = bookedChairs[chairId];
    const displayLabel = isBooked ? bookedChairs[chairId] : label;
  
    return (
      <button
        onClick={() => onClick(chairId, roomId)}
        className={`p-1 rounded-full border-[1px] ${
          isBooked
            ? "bg-green-400 border-green-500 text-white"
            : "bg-white border-green-300 text-green-800"
        } hover:bg-green-300 hover:animate-pulse-scale transition-all text-xs font-medium`}
      >
        {displayLabel}
      </button>
    );
  }