import React from 'react';

type Props = {
  selected?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  handleClick?: () => void;
};

export default function Tool({ children, disabled, selected, handleClick }: Props) {
  const TEMPLATE_CLASS = 'flex items-center justify-center h-10 w-10 rounded-lg';
  const TRANSITION_CLASS = 'transition duration-100 ease-in-out';
  const DEFAULT_COLOR_CLASS = 'bg-white hover:bg-gray-200';
  const SELECTED_COLOR_CLASS = 'bg-primary-orange';
  const ABLE_CLASS = 'cursor-pointer';
  const DISABLED_CLASS = 'cursor-not-allowed';

  return (
    <div
      onClick={handleClick}
      className={`
        ${TEMPLATE_CLASS} 
        ${TRANSITION_CLASS} 
        ${selected ? SELECTED_COLOR_CLASS : DEFAULT_COLOR_CLASS}
        ${disabled ? DISABLED_CLASS : ABLE_CLASS}
      `}
    >
      {children}
    </div>
  );
}
