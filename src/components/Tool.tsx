import React from 'react';

type Props = {
  selected?: boolean;
  children: React.ReactNode;
  handleClick?: () => void;
};

export default function Tool({ children, selected, handleClick }: Props) {
  const TEMPLATE_CLASS = 'flex items-center justify-center h-10 w-10 rounded-lg';
  const TRANSITION_CLASS = 'transition duration-100 ease-in-out';
  const DEFAULT_COLOR_CLASS = 'bg-white hover:bg-gray-200 cursor-pointer';
  const SELECTED_COLOR_CLASS = 'bg-primary-orange';

  return (
    <div
      onClick={handleClick}
      className={`
        ${TEMPLATE_CLASS} 
        ${TRANSITION_CLASS} 
        ${selected ? SELECTED_COLOR_CLASS : DEFAULT_COLOR_CLASS}
      `}
    >
      {children}
    </div>
  );
}
