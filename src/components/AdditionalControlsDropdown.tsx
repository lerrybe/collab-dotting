import Toggle from './Toggle.tsx';
import { useDottingContext } from '../context/DottingContext.tsx';

export default function AdditionalControlsDropdown() {
  const {
    isGridFixed,
    isGridVisible,
    isPanZoomEnable,
    setIsGridFixed,
    setIsGridVisible,
    setIsPanZoomEnable,
  } = useDottingContext();

  return (
    <>
      <div
        id='dropdownToggle'
        className='z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-48 dark:bg-gray-700 dark:divide-gray-600'
      >
        <ul
          className='p-3 space-y-1 text-sm text-gray-700 dark:text-gray-200'
          aria-labelledby='additionalControls'
        >
          <Toggle text={'Is Grid fixed'} checked={isGridFixed} onChange={setIsGridFixed} />
          <Toggle text={'Is Grid visible'} checked={isGridVisible} onChange={setIsGridVisible} />
          <Toggle
            text={'Is PanZoom able'}
            checked={isPanZoomEnable}
            onChange={setIsPanZoomEnable}
          />
        </ul>
      </div>
    </>
  );
}
