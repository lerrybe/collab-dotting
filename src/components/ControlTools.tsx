import React, { ForwardedRef, forwardRef } from 'react';
import { DottingRef } from 'dotting';

import Tool from './Tool';
import { FaRegTrashAlt } from 'react-icons/fa';
import { BiRedo, BiUndo } from 'react-icons/bi';
import { MdOutlineAddPhotoAlternate } from 'react-icons/md';
import { TOOL_GIRD_CLASS, TOOL_TEMPLATE_CLASS } from '../styles/styleClass';

const ControlTools = forwardRef(function InnerToolbar(
  { undo, redo, clear }: { undo: () => void; redo: () => void; clear: () => void },
  ref: ForwardedRef<DottingRef>,
) {
  return (
    <div className={`${TOOL_TEMPLATE_CLASS} ${TOOL_GIRD_CLASS}`}>
      <Tool
        handleClick={() => {
          alert('Add image to pixelate');
        }}
      >
        <MdOutlineAddPhotoAlternate color={'#000'} size={18} />
      </Tool>
      <Tool handleClick={clear}>
        <FaRegTrashAlt color={'#000'} size={14} />
      </Tool>
      <Tool handleClick={undo}>
        <BiUndo color={'#000'} size={20} />
      </Tool>
      <Tool handleClick={redo}>
        <BiRedo color={'#000'} size={20} />
      </Tool>
    </div>
  );
});

export default ControlTools;
