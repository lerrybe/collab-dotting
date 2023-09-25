import Toggle from './Toggle';
import { useDottingContext } from '../context/DottingContext';

export default function AdditionalControlsDropdown() {
  const {
    isGridFixed,
    isGridVisible,
    isPanZoomEnable,
    setIsGridFixed,
    setIsGridVisible,
    setIsPanZoomEnable,
  } = useDottingContext();
  const INNER_CONTAINER_CLASS = 'p-3 space-y-1 text-sm text-gray-700 dark:text-gray-200';
  const DROPDOWN_CONTAINER_CLASS =
    'z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-48 dark:bg-gray-700 dark:divide-gray-600';

  return (
    <>
      <div id='dropdownToggle' className={DROPDOWN_CONTAINER_CLASS}>
        <ul className={INNER_CONTAINER_CLASS} aria-labelledby='additionalControls'>
          {/* TODO: GRID change for yorkie remote */}
          <Toggle
            text={'Is Grid visible'}
            checked={isGridVisible}
            handleChange={setIsGridVisible}
          />
          <Toggle
            text={'Is PanZoom able'}
            checked={isPanZoomEnable}
            handleChange={setIsPanZoomEnable}
          />
          <Toggle text={'Is Grid fixed'} checked={isGridFixed} handleChange={setIsGridFixed} />
        </ul>
      </div>
    </>
  );
}
