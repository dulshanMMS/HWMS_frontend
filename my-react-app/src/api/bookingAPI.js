export const getBookings = async () => {
    const response = await fetch('http://localhost:5000/api/bookings');
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Get bookings failed with status:", response.status, "Response:", errorText);
      throw new Error('Failed to fetch bookings');
    }
    const data = await response.json();
    if (data.chairs) {
      Object.keys(data.chairs).forEach((chairId) => {
        const chair = data.chairs[chairId];
        if (!chair.memberName || !chair.teamColor) {
          console.warn(`Missing memberName or teamColor for chair ${chairId}. Got:`, chair);
        }
      });
    } else {
      console.warn("No chairs found in bookings response:", data);
    }
    return data;
  };
  
  export const bookSeat = async (chairId, bookingDetails) => {
    const { roomId, userName, teamName, role, selectedMember, teamColor, memberName } = bookingDetails;
    let url = '';
  
    if (role === 'leader' && selectedMember) {
      url = `http://localhost:5000/api/bookings/leader/${userName}/member/${selectedMember}/seat/${chairId}`;
    } else {
      url = `http://localhost:5000/api/bookings/member/${userName}/seat/${chairId}`;
    }
  
    const body = { roomId, teamName, teamColor, memberName };
    console.log("Sending book seat request:", { url, body }); // Debug log
  
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
      throw new Error(errorData.error || 'Failed to book seat');
    }
  
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to book seat');
    }
    return data;
  };
  
  export const unbookSeat = async (roomId, chairId) => {
    const response = await fetch(`http://localhost:5000/api/bookings/unbook/${roomId}/${chairId}`, {
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
      throw new Error(errorData.error || 'Failed to unbook seat');
    }
    return response.json();
  };