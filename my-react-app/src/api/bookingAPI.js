// bookingAPI.js - Self-booking only version
export const getBookings = async () => {
  const response = await fetch('http://localhost:6001/api/bookings');
  if (!response.ok) {
    const errorText = await response.text();
    console.error("Get bookings failed with status:", response.status, "Response:", errorText);
    throw new Error('Failed to fetch bookings');
  }
  const data = await response.json();
  if (data.chairs) {
    Object.keys(data.chairs).forEach((chairId) => {
      const chair = data.chairs[chairId];
      if (!chair.userName || !chair.teamColor) {
        console.warn(`Missing userName or teamColor for chair ${chairId}. Got:`, chair);
      }
    });
  } else {
    console.warn("No chairs found in bookings response:", data);
  }
  return data;
};

// SIMPLIFIED: Only self-booking allowed - removed leader booking logic
export const bookSeat = async (chairId, bookingDetails) => {
  const { roomId, userName, teamName, teamColor } = bookingDetails;
  
  // SELF-BOOKING ONLY: Always use the member booking endpoint
  const url = `http://localhost:6001/api/bookings/member/${userName}/seat/${chairId}`;

  const body = { 
    roomId, 
    teamName, 
    teamColor, 
    userName
  };
  
  console.log("Sending self-booking request:", { url, body });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Book seat failed with status:", response.status, "Response:", errorText);
    let errorData = {};
    try {
      errorData = JSON.parse(errorText);
    } catch (e) {
      throw new Error(`Failed to book seat: Unexpected response format - ${errorText.slice(0, 50)}...`);
    }
    throw new Error(errorData.error || errorData.message || 'Failed to book seat');
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || data.message || 'Failed to book seat');
  }
  return data;
};

export const unbookSeat = async (roomId, chairId, floor, date) => {
  const response = await fetch(`http://localhost:6001/api/bookings/unbook/${roomId}/${chairId}/${floor}/${date}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error("Unbook seat failed with status:", response.status, "Response:", errorText);
    let errorData = {};
    try {
      errorData = JSON.parse(errorText);
    } catch (e) {
      throw new Error(`Failed to unbook seat: Unexpected response format - ${errorText.slice(0, 50)}...`);
    }
    throw new Error(errorData.error || errorData.message || 'Failed to unbook seat');
  }
  return response.json();
};