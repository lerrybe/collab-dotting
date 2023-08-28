import React, { ForwardedRef, forwardRef } from 'react';
import { useParams } from 'react-router-dom';
import { DottingRef, useDotting } from 'dotting';

import { BASE_URL } from '../constant/urls';
import { handleCopyLink } from '../utils/clipboard';

import { RxHamburgerMenu } from 'react-icons/rx';
import { BiDownload, BiShareAlt } from 'react-icons/bi';
import AdditionalControlsDropdown from './AdditionalControlsDropdown';

const Menu = forwardRef(function InnerToolbar({}, ref: ForwardedRef<DottingRef>) {
  // @ts-ignore
  const { downloadImage } = useDotting(ref);
  const { docId } = useParams();

  const CONTAINER_CLASS =
    'flex items-center p-1 gap-0.5 w-auto h-auto bg-light-gray rounded-lg shadow-lg';
  const TRANSITION_CLASS = 'transition duration-100 ease-in-out';
  const DEFAULT_COLOR_CLASS = 'hover:bg-gray-200 cursor-pointer';
  const TEMPLATE_CLASS = 'flex items-center justify-center h-10 w-10 rounded-lg';

  return (
    <div className={CONTAINER_CLASS}>
      <button
        type='button'
        id='additionalControls'
        data-dropdown-toggle='dropdownToggle'
        className={`${TRANSITION_CLASS} ${DEFAULT_COLOR_CLASS} ${TEMPLATE_CLASS}`}
      >
        <RxHamburgerMenu />
      </button>
      <AdditionalControlsDropdown />

      <button
        type='button'
        onClick={() => {
          downloadImage();
        }}
        className={`${TRANSITION_CLASS} ${DEFAULT_COLOR_CLASS} ${TEMPLATE_CLASS}`}
      >
        <BiDownload />
      </button>

      <button
        type='button'
        onClick={() => {
          handleCopyLink(`${BASE_URL}/${docId}`).then(() => {
            alert('현재 작업 링크가 복사되었습니다.');
          });
        }}
        className={`${TRANSITION_CLASS} ${DEFAULT_COLOR_CLASS} ${TEMPLATE_CLASS}`}
      >
        <BiShareAlt />
      </button>
    </div>
  );
});

export default Menu;
