export const getBookings = async () => {
    const response = await fetch('http://localhost:5004/api/bookings');
    if (!response.ok) {
      throw new Error('Failed to fetch bookings');
    }
    return response.json();
  };
  
  export const bookSeat = async (chairId, bookingDetails) => {
    const { roomId, userName, teamName } = bookingDetails;
    let url = '';
    if (bookingDetails.role === 'leader' && bookingDetails.selectedMember) {
      url = `http://localhost:5004/api/bookings/leader/${userName}/member/${bookingDetails.selectedMember}/seat/${chairId}`;
    } else {
      url = `http://localhost:5004/api/bookings/member/${userName}/seat/${chairId}`;
    }
  
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roomId, teamName }),
    });
    if (!response.ok) {
      throw new Error('Failed to book seat');
    }
    return response.json();
  };
  
  export const unbookSeat = async (chairId) => {
    const response = await fetch(`http://localhost:5004/api/bookings/unbook/${chairId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to unbook seat');
    }
    return response.json();
  };