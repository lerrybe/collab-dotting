type Props = {
  text: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export default function Toggle({ text, checked, onChange }: Props) {
  const DEFAULT_CLASS = 'w-9 h-5 bg-gray-200 rounded-full';
  const AFTER_CLASS =
    'after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 ' +
    'after:border after:rounded-full after:h-4 after:w-4 after:transition-all';
  const PEER_FOCUS_CLASS =
    'peer peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-orange-light ' +
    "peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] " +
    'peer-checked:bg-primary-orange';

  return (
    <li>
      <div className='flex p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600'>
        <label className='relative inline-flex items-center w-full cursor-pointer'>
          <input
            type='checkbox'
            value=''
            checked={checked}
            className='sr-only peer'
            onChange={() => onChange(!checked)}
          />
          <div className={`${DEFAULT_CLASS} ${AFTER_CLASS} ${PEER_FOCUS_CLASS}`}></div>
          <span className='ml-3 text-sm font-medium text-gray-900 dark:text-gray-300'>{text}</span>
        </label>
      </div>
    </li>
  );
}
