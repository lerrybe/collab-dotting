import Toggle from './Toggle';
import { useDottingContext } from '../context/DottingContext';

export default function AdditionalControlsDropdown() {
  const { isGridVisible, isPanZoomEnable, setIsGridVisible, setIsPanZoomEnable } =
    useDottingContext();

  const DROPDOWN_CONTAINER_CLASS =
    'z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-48 dark:bg-gray-700 dark:divide-gray-600';
  const INNER_CONTAINER_CLASS = 'p-3 space-y-1 text-sm text-gray-700 dark:text-gray-200';

  return (
    <>
      <div id='dropdownToggle' className={DROPDOWN_CONTAINER_CLASS}>
        <ul className={INNER_CONTAINER_CLASS} aria-labelledby='additionalControls'>
          {/* TODO: GRID change for yorkie remote */}
          {/* <Toggle text={'Is Grid fixed'} checked={isGridFixed} onChange={setIsGridFixed} /> */}
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
