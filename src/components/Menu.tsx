import React, { ForwardedRef, forwardRef } from 'react';
import { DottingRef, useDotting } from 'dotting';
import LogoImage from '../assets/logo.svg';

import { BiDownload } from 'react-icons/bi';
import { RxHamburgerMenu } from 'react-icons/rx';
import AdditionalControlsDropdown from './AdditionalControlsDropdown.tsx';
import Tool from './Tool.tsx';

const Menu = forwardRef(function InnerToolbar({}, ref: ForwardedRef<DottingRef>) {
  // @ts-ignore
  const { downloadImage } = useDotting(ref);

  const TRANSITION_CLASS = 'transition duration-100 ease-in-out';
  const DEFAULT_COLOR_CLASS = 'hover:bg-gray-200 cursor-pointer';
  const TEMPLATE_CLASS = 'flex items-center justify-center h-10 w-10 rounded-lg';

  return (
    <div className='flex items-center p-1 gap-0.5 w-auto h-auto bg-light-gray rounded-lg shadow-lg'>
      <img src={LogoImage} alt='logo' className='w-10 h-10 mr-2' />
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
    </div>
  );
});

export default Menu;
