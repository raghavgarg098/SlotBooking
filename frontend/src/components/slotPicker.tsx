import React from 'react';
import './calendarView.css';

interface SlotPickerProps {
  children: React.ReactNode;
}

const SlotPicker: React.FC<SlotPickerProps> = ({ children }) => {
  return <div className="slot-picker">{children}</div>;
};

export default SlotPicker;