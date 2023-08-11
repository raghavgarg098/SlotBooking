import React from 'react';
import  { useState } from 'react';


interface BookedSlot {
    slot_id: string;
    scheduled_start_datetime: number;
    scheduled_end_datetime: number;
    user_id: string;
    message: string|null;
}

interface SlotModalProps {
    slotId: number;
    user_id: string | null | undefined;
    onClose: () => void;
    onBookSlot: (slotId: number, message:string|null) => void;
    onCancelSlot: (slotId: number) => void;
    isSlotBooked: boolean;
    currentUserId: string;
    originalSlot: BookedSlot|null;
    startEpoch: number;
    endEpoch: number;
  }

const SlotModal: React.FC<SlotModalProps> = ({
  slotId,
  user_id,
  onClose,
  onBookSlot,
  onCancelSlot,
  isSlotBooked,
  currentUserId,
  originalSlot,
  startEpoch,
  endEpoch,
}) => {
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="slot-modal">
      <h3>Slot Information</h3>
      {!isSlotBooked && (
        <div>
          <p>This slot is available for booking.</p>
          <p>Start Time: {new Date(startEpoch).toLocaleString()}</p>
          <p>End Time: {new Date(endEpoch).toLocaleString()}</p>
          <input
            type="text"
            placeholder="Enter a message (optional)"
            value={message || ''}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button onClick={() => onBookSlot(slotId, message)}>Book Slot</button>
        </div>
      )}
      {isSlotBooked && user_id === currentUserId && (
        <div>
          <p>You have booked this slot.</p>
          <p>Start Time: {originalSlot && new Date(originalSlot.scheduled_start_datetime).toLocaleString()}</p>
          <p>End Time: {originalSlot && new Date(originalSlot.scheduled_end_datetime).toLocaleString()}</p>
          <p>{originalSlot?.message}</p>
          <button onClick={() => onCancelSlot(slotId)}>Cancel Booking</button>
        </div>
      )}
      {isSlotBooked && user_id !== currentUserId && (
        <div>
        <p>Start Time: {originalSlot && new Date(originalSlot.scheduled_start_datetime).toLocaleString()}</p>
        <p>End Time: {originalSlot && new Date(originalSlot.scheduled_end_datetime).toLocaleString()}</p>
        <p>This slot is already occupied by another user.</p>
        </div>
      )}
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default SlotModal;
