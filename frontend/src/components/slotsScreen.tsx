import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CalendarView: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookedSlots, setBookedSlots] = useState([]);

  useEffect(() => {
    fetchBookedSlots(selectedDate);
  }, [selectedDate]);

  const fetchBookedSlots = async (date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const startEpoch = startOfDay.getTime();
    const endEpoch = startEpoch + 24 * 60 * 60 * 1000 - 1;

    try {
      const response = await fetch(`/slots?user_id=user_id_here&start_datetime=${startEpoch}&end_datetime=${endEpoch}`);
      if (response.ok) {
        const data = await response.json();
        setBookedSlots(data);
      } else {
        console.error('Error fetching booked slots:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching booked slots:', error);
    }
  };

  const handleSlotInvalidate = async (slotId: string) => {
    try {
      const response = await fetch('/slot', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slot_id: slotId, action: 'INVALIDATE' }),
      });

      if (response.ok) {
        // Refresh booked slots after successful invalidation
        fetchBookedSlots(selectedDate);
      } else {
        console.error('Error invalidating slot:', response.statusText);
      }
    } catch (error) {
      console.error('Error invalidating slot:', error);
    }
  };

  return (
    <div className="calendar-view">
      {/* Date Selector */}
      <DatePicker selected={selectedDate} onChange={(date) => setSelectedDate(date)} />

      {/* Calendar */}
      <div className="calendar">
        {/* Render the calendar here */}
      </div>

      {/* Booked Slots */}
      <div className="booked-slots">
        {bookedSlots.map((slot: any) => (
          <div key={slot.slot_id} className="booked-slot">
            {/* Render the booked slot information */}
            <span>{new Date(slot.scheduled_start_datetime).toLocaleTimeString()}</span>
            <span>{new Date(slot.scheduled_end_datetime).toLocaleTimeString()}</span>
            <button onClick={() => handleSlotInvalidate(slot.slot_id)}>Invalidate</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarView;
