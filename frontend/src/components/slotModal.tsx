import React from 'react';

interface SlotModalProps {
    slotId: number;
    user_id: string | null | undefined;
    onClose: () => void;
    onBookSlot: (slotId: number) => void;
    onCancelSlot: (slotId: number) => void;
    isSlotSelected: boolean;
    isSlotBooked: boolean;
    currentUserId: string;
  }

const SlotModal: React.FC<SlotModalProps> = ({
  slotId,
  user_id,
  onClose,
  onBookSlot,
  onCancelSlot,
  isSlotSelected,
  isSlotBooked,
  currentUserId,
}) => {
    console.log(slotId, user_id, isSlotBooked, isSlotSelected, 'here');
  return (
    <div className="slot-modal">
      <h3>Slot Information</h3>
      {!isSlotBooked && (
        <div>
          <p>This slot is available for booking.</p>
          <p>Start Time: {/* display start time based on slotId */}</p>
          <button onClick={() => onBookSlot(slotId)}>Book Slot</button>
        </div>
      )}
      {isSlotBooked && user_id === currentUserId && (
        <div>
          <p>You have booked this slot.</p>
          <p>Start Time: {/* display start time based on slotId */}</p>
          <button onClick={() => onCancelSlot(slotId)}>Cancel Booking</button>
        </div>
      )}
      {isSlotBooked && user_id !== currentUserId && (
        <p>This slot is already occupied by another user.</p>
      )}
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default SlotModal;
