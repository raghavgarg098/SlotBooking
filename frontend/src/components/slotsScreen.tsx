import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../App.css';
import moment from 'moment';
import SlotPicker from './slotPicker';
import SlotModal from './slotModal';
import Modal from 'react-modal';

interface BookedSlot {
  slot_id: string;
  scheduled_start_datetime: number;
  scheduled_end_datetime: number;
  user_id: string;
  message: string|null;
}

interface calendarViewProps {
  userId: string;
}

const CalendarView: React.FC<calendarViewProps> = ({ userId }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

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

    const originalSlot = getOriginalSlot(slotId);
    if (originalSlot) {
        return originalSlot.slot_id;
    } else {
        return null;
    }
  };

  const getOriginalSlot = (slotId: number) => {
    const startEpoch = getStartEpoch(slotId);
    const endEpoch = getEndEpoch(startEpoch);
  
    return bookedSlots.find(
      (slot) =>
        slot.scheduled_start_datetime === startEpoch &&
        slot.scheduled_end_datetime === endEpoch
    ) || null;
  };


  const handleSlotDeselection = async (originalSlotId: string | null) => {
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

  const fetchSlotBooking = async (userId: string, startEpoch: number, endEpoch: number, message:string|null) => {
    return await fetch('http://localhost:3003/slots', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId, scheduled_start_datetime: startEpoch, scheduled_end_datetime: endEpoch, message:message }),
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
      const isSelected = isSlotSelected(slotId);
      const isBooked = isSlotBooked(slotId);
      const originalSlot = getOriginalSlot(slotId)
      const isOccupied = isSelected && isBooked && originalSlot && userId !== originalSlot?.user_id;
  
      slots.push(
        <div
          key={slotId}
          className={`slot ${
            isSelected ? (isOccupied ? 'occupied' : 'selected') : ''
          } ${isBooked ? 'booked' : ''}`}
          onClick={() => handleSlotClick(slotId)}
        >
          {moment(startTime).format('hh:mm A')}
        </div>
      );
    }
  
    return slots;
  };
  
  

  const handleSlotClick = (slotId: number) => {
    setSelectedSlot(slotId);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedSlot(null);
    setShowModal(false);
  };

  const handleBookSlot = async (slotId: number, message:string|null) => {
    const startEpoch = getStartEpoch(slotId);
    const endEpoch = getEndEpoch(startEpoch);

    try {
      const response = await fetchSlotBooking(userId, startEpoch, endEpoch, message);

      if (response.ok) {
        fetchBookedSlots(selectedDate);
      } else {
        console.error('Error booking slot:', response.statusText);
      }
    } catch (error) {
      console.error('Error handling slot selection:', error);
    }
    handleCloseModal();
  };

  const handleCancelSlot = async (slotId: number) => {
    const originalSlotId = getOriginalSlotId(slotId);
    await handleSlotDeselection(originalSlotId);
    handleCloseModal();
  };

  const closeModal = () => {
    setSelectedSlot(null);
    setShowModal(false);
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
      {selectedSlot !== null && (
        <Modal
          isOpen={showModal}
          onRequestClose={closeModal}
          contentLabel="Slot Details"
          ariaHideApp={false}
        >
          <SlotModal
            slotId={selectedSlot}
            user_id={bookedSlots.find(slot => slot.slot_id === getOriginalSlotId(selectedSlot))?.user_id}
            onClose={handleCloseModal}
            onBookSlot={handleBookSlot}
            onCancelSlot={handleCancelSlot}
            isSlotBooked={isSlotBooked(selectedSlot)}
            currentUserId={userId}
            originalSlot={getOriginalSlot(selectedSlot)}
            startEpoch={getStartEpoch(selectedSlot)}
            endEpoch={getEndEpoch(getStartEpoch(selectedSlot))}
          />
        </Modal>
      )}
    </div>
  );
};

export default CalendarView;
