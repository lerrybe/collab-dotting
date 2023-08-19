import React, { ForwardedRef, forwardRef, useEffect } from 'react';
import { DottingRef, useDotting } from 'dotting';

import Tool from './Tool.js';
import { FaRegTrashAlt } from 'react-icons/fa';
import { BiRedo, BiUndo } from 'react-icons/bi';
import { MdOutlineAddPhotoAlternate } from 'react-icons/md';
import { TOOL_GIRD_CLASS, TOOL_TEMPLATE_CLASS } from '../styles/styleClass.js';

const ControlTools = forwardRef(function InnerToolbar({}, ref: ForwardedRef<DottingRef>) {
  // @ts-ignore
  const { undo, redo, clear } = useDotting(ref);

  useEffect(() => {
    const keyboardUndoListener = (e: KeyboardEvent) => {
      if (e.code === 'KeyZ' && (e.ctrlKey || e.metaKey)) {
        undo();
      }
    };
    const keyboardRedoListener = (e: KeyboardEvent) => {
      if (e.code === 'KeyR' && (e.ctrlKey || e.metaKey)) {
        redo();
      }
    };
    document.addEventListener('keydown', keyboardUndoListener);
    document.addEventListener('keydown', keyboardRedoListener);
    return () => {
      document.removeEventListener('keydown', keyboardUndoListener);
      document.removeEventListener('keydown', keyboardRedoListener);
    };
  }, []);

  return (
    <div className={`${TOOL_TEMPLATE_CLASS} ${TOOL_GIRD_CLASS}`}>
      <Tool
        handleClick={() => {
          alert('Add image to pixelate');
        }}
      >
        <MdOutlineAddPhotoAlternate color={'#000'} size={18} />
      </Tool>
      <Tool
        handleClick={() => {
          clear();
          alert('Apply clear data to remote yorkie document');
        }}
      >
        <FaRegTrashAlt color={'#000'} size={14} />
      </Tool>
      <Tool
        handleClick={() => {
          alert('global undo');
        }}
      >
        <BiUndo color={'#000'} size={20} />
      </Tool>
      <Tool
        handleClick={() => {
          alert('global redo');
        }}
      >
        <BiRedo color={'#000'} size={20} />
      </Tool>
    </div>
  );
});

export default ControlTools;
