interface Props {
  name?: string;
  isCurrentClient?: boolean;
}
export default function ClientInfoDropdown({ name, isCurrentClient }: Props) {
  const DISPLAY_CLASS = 'w-min absolute top-10 right-1 p-2 flex flex-col gap-1';
  const STYLE_CLASS = 'bg-gray-800 rounded-md text-white text-center text-[12px] leading-4';
  return (
    <div className={`${DISPLAY_CLASS} ${STYLE_CLASS}`}>
      {name}
      {isCurrentClient && <span className='text-yellow-300'>(You)</span>}
    </div>
  );
}
