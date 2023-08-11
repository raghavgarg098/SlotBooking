import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../App.css'
import moment from 'moment';
import SlotPicker from './slotPicker';

interface BookedSlot {
  slot_id: string;
  scheduled_start_datetime: number;
  scheduled_end_datetime: number;
}

interface calendarViewProps{
  userId: string;
}

const CalendarView: React.FC<calendarViewProps> = ({ userId }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);

  useEffect(() => {
    fetchBookedSlots(selectedDate);
  }, [selectedDate]);

  const fetchBookedSlots = async (date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const startEpoch = startOfDay.getTime();
    const endEpoch = startEpoch + 24 * 60 * 60 * 1000 - 1;

    try {
      const response = await fetch(`http://localhost:3003/slots?user_id=${userId}&start_datetime=${startEpoch}&end_datetime=${endEpoch}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setBookedSlots(data);
        } else {
          console.error('Fetched data is not an array:', data);
        }
      } else {
        console.error('Error fetching booked slots:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching booked slots:', error);
    }
  };

  const getOriginalSlotId = (slotId: number) => {
    const startEpoch = getStartEpoch(slotId);
    const endEpoch = getEndEpoch(startEpoch);
  
    for (const slot of bookedSlots) {
      if (
        slot.scheduled_start_datetime === startEpoch &&
        slot.scheduled_end_datetime === endEpoch
      ) {
        console.log("Found matching slot:", slot);
        return slot.slot_id;
      }
    }
    console.log("No matching slot found");
    return null;
  };
  

  const handleSlotDeselection = async (originalSlotId: string|null) => {
    try {
      if (originalSlotId) {
        const response = await fetchSlotAction(originalSlotId, 'INVALIDATE');
        
        if (response.ok) {   
          fetchBookedSlots(selectedDate);
        } else {
          console.error('Error invalidating slot:', response.statusText);
        }
      }
    } catch (error) {
      console.error('Error handling slot deselection:', error);
    }
  };

  const fetchSlotAction = async (slotId: string, action: string) => {
    return await fetch('http://localhost:3003/slot', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ slot_id: slotId, action }),
    });
  };
  

  const handleSlotSelect = async (slotId: number) => {
    const startEpoch = getStartEpoch(slotId);
    const endEpoch = getEndEpoch(startEpoch);
    
    try {
      if (isSlotSelected(slotId)) {
        const originalSlotId = getOriginalSlotId(slotId);
        console.log(slotId, originalSlotId, startEpoch, endEpoch)
        await handleSlotDeselection(originalSlotId);
      } else {
        const response = await fetchSlotBooking(userId, startEpoch, endEpoch);
  
        if (response.ok) {
          fetchBookedSlots(selectedDate);
        } else {
          console.error('Error booking slot:', response.statusText);
        }
      }
    } catch (error) {
      console.error('Error handling slot selection:', error);
    }
  };
  
  const fetchSlotBooking = async (userId: string, startEpoch: number, endEpoch: number) => {
    return await fetch('http://localhost:3003/slots', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId, scheduled_start_datetime: startEpoch, scheduled_end_datetime: endEpoch }),
    });
  };

  const getStartEpoch = (slotId: number) => {
    return moment(selectedDate)
      .startOf('day')
      .add(slotId * 30, 'minutes')
      .valueOf();
  };  

  const getEndEpoch = (startEpoch: number) => {
    return moment(startEpoch)
      .add(30, 'minutes')
      .valueOf();
  };

  const isSlotSelected = (slotId: number) => {
    const startEpoch = getStartEpoch(slotId);
    const endEpoch = getEndEpoch(startEpoch);

    return bookedSlots.some(
      (slot) =>
        slot.scheduled_start_datetime === startEpoch &&
        slot.scheduled_end_datetime === endEpoch
    );
  };

  const isSlotBooked = (slotId: number) => {
    const startEpoch = getStartEpoch(slotId);
    const endEpoch = getEndEpoch(startEpoch);

    return bookedSlots.some(
      (slot) =>
        slot.scheduled_start_datetime === startEpoch &&
        slot.scheduled_end_datetime === endEpoch
    );
  };

  const renderSlots = () => {
    const slots: JSX.Element[] = [];
    const numberOfSlots = 48; // 24 hours with half-hour intervals

    for (let i = 0; i < numberOfSlots; i++) {
      const startTime = moment().startOf('day').add(i * 30, 'minutes').toDate();
      const slotId = i;

      slots.push(
        <div
          key={slotId}
          className={`slot ${
            isSlotSelected(slotId) ? 'selected' : ''
          } ${isSlotBooked(slotId) ? 'booked' : ''}`}
          onClick={() => handleSlotSelect(slotId)}
        >
          {moment(startTime).format('hh:mm A')}
        </div>
      );
    }

    return slots;
  };

  return (
    <div className="calendar-view">
      <h2>Calendar View</h2>
      <div className="date-picker-container">
        <DatePicker selected={selectedDate} onChange={(date) => setSelectedDate(date)} />
      </div>
      <div className="slot-picker-container">
        <SlotPicker>{renderSlots()}</SlotPicker>
      </div>
    </div>
  );
};

export default CalendarView;
