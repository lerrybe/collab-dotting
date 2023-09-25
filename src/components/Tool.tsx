import React from 'react';

type Props = {
  selected?: boolean;
  disabled?: boolean;
  handleClick?: () => void;
  children: React.ReactNode;
};

export default function Tool({ children, disabled, selected, handleClick }: Props) {
  const ABLE_CLASS = 'cursor-pointer';
  const DISABLED_CLASS = 'cursor-not-allowed';
  const SELECTED_COLOR_CLASS = 'bg-primary-orange';
  const DEFAULT_COLOR_CLASS = 'bg-white hover:bg-gray-200';
  const TRANSITION_CLASS = 'transition duration-100 ease-in-out';
  const CONTAINER_CLASS = 'flex items-center justify-center h-10 w-10 rounded-lg';

  return (
    <div
      onClick={handleClick}
      className={`
        ${CONTAINER_CLASS} 
        ${TRANSITION_CLASS} 
        ${disabled ? DISABLED_CLASS : ABLE_CLASS}
        ${selected ? SELECTED_COLOR_CLASS : DEFAULT_COLOR_CLASS}
      `}
    >
      {children}
    </div>
  );
}
