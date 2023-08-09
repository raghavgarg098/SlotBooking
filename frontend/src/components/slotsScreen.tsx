import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './calendarView.css'
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';


const localizer = momentLocalizer(moment);

interface BookedSlot {
  slot_id: string;
  scheduled_start_datetime: number;
  scheduled_end_datetime: number;
}

interface calendarViewProps{
  userId: string;
}

const CalendarView: React.FC<calendarViewProps> = ({userId}) => {
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
        if (Array.isArray(data)) { // Check if data is an array before setting the state
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

  const handleSlotSelect = (event: any) => {
    console.log('Selected slot start:', event.start);
    console.log('Selected slot end:', event.end);
  
    // Now you can perform any additional actions or logic related to the selected slot
  };

  const events = Array.isArray(bookedSlots)
    ? bookedSlots.map(slot => ({
        id: slot.slot_id,
        title: 'Booked',
        start: new Date(slot.scheduled_start_datetime),
        end: new Date(slot.scheduled_end_datetime),
      }))
    : [];


  return (
    <div className="calendar-view">
      <h2>Calendar View</h2>
      <div className="date-picker-container">
        <DatePicker selected={selectedDate} onChange={(date) => setSelectedDate(date)} />
      </div>
      <Calendar
  localizer={localizer}
  events={events}
  date={selectedDate}
  startAccessor="start"
  endAccessor="end"
  defaultView="day"
  views={['day']}
  toolbar={false}
  selectable
  onSelectSlot={handleSlotSelect} // Use onSelectEvent instead of onSelectSlot
/>
    </div>
  );



};

export default CalendarView;
