import React from 'react';
import '../App.css';

interface SlotPickerProps {
  children: React.ReactNode;
}

const SlotPicker: React.FC<SlotPickerProps> = ({ children }) => {
  return <div className="slot-picker">{children}</div>;
};

export default SlotPicker;