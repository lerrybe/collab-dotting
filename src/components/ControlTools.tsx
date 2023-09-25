import React, { forwardRef, MutableRefObject } from 'react';
import { DottingRef, useDotting } from 'dotting';

import Tool from './Tool';
import { FaRegTrashAlt } from 'react-icons/fa';
import { BiRedo, BiUndo } from 'react-icons/bi';
import { MdOutlineAddPhotoAlternate } from 'react-icons/md';
import { TOOL_GIRD_CLASS, TOOL_TEMPLATE_CLASS } from '../styles/styleClass';

const ControlTools = forwardRef(function InnerToolbar(
  { clear }: { clear: () => void },
  ref: MutableRefObject<DottingRef>,
) {
  const { undo, redo } = useDotting(ref);

  return (
    <div className={`${TOOL_TEMPLATE_CLASS} ${TOOL_GIRD_CLASS}`}>
      {/* TODO: add image to pixelate */}
      <Tool
        disabled
        handleClick={() => {
          return;
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
