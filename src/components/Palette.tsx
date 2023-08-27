import React, { ForwardedRef, forwardRef, useCallback, useState } from 'react';
import { DottingRef, useBrush } from 'dotting';

import { TOOL_TEMPLATE_CLASS } from '../styles/styleClass';

const Palette = forwardRef(function InnerToolbar({}, ref: ForwardedRef<DottingRef>) {
  // @ts-ignore
  const { changeBrushColor, brushColor } = useBrush(ref);

  const handleColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    changeBrushColor.bind(null, e.target.value)();
  }, []);

  const DISPLAY_CLASS = 'flex justify-center items-center';

  return (
    <div className={`${TOOL_TEMPLATE_CLASS} ${DISPLAY_CLASS}`}>
      <div className='w-10 h-10'>
        <input type='color' value={brushColor} onChange={handleColorChange} className='color' />
      </div>
    </div>
  );
});

export default Palette;
