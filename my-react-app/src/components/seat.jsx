export default function Seat({ chairId, bookedChairs, onClick, label }) {
    const chairData = bookedChairs[chairId] || {};
    const isBooked = !!chairData.memberName;
    const chairColor = chairData.teamColor || '#D1D5DB'; // Fallback to gray if teamColor is missing
  
    return (
      <button
        className={`w-14 h-7 rounded-lg flex items-center justify-center text-[10px] font-semibold cursor-pointer transition-all duration-300 overflow-hidden truncate border border-gray-400 shadow-md hover:shadow-lg ${
          isBooked ? 'text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        }`}
        style={isBooked ? { backgroundColor: chairColor } : {}}
        onClick={() => onClick(chairId, chairId.split('-')[0])}
        title={isBooked ? `Booked by ${chairData.memberName}` : 'Available'}
      >
        {isBooked ? chairData.memberName : label}
      </button>
    );
  }