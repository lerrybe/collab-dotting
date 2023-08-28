import React, { ForwardedRef, forwardRef } from 'react';
import { BrushTool, DottingRef, useBrush } from 'dotting';

import Tool from './Tool';
import { BiSolidSquare } from 'react-icons/bi';
import { PiSelectionPlusBold } from 'react-icons/pi';
import { LuEraser, LuPaintBucket } from 'react-icons/lu';
import { TOOL_GIRD_CLASS, TOOL_TEMPLATE_CLASS } from '../styles/styleClass';

const PaintTools = forwardRef(function InnerToolbar({}, ref: ForwardedRef<DottingRef>) {
  // @ts-ignore
  const { changeBrushTool, brushTool } = useBrush(ref);

  return (
    <div className={`${TOOL_TEMPLATE_CLASS} ${TOOL_GIRD_CLASS}`}>
      <Tool
        selected={brushTool === BrushTool.DOT}
        handleClick={() => {
          changeBrushTool(BrushTool.DOT);
        }}
      >
        <BiSolidSquare size={10} color={brushTool === BrushTool.DOT ? '#fff' : '#000'} />
      </Tool>
      <Tool
        selected={brushTool === BrushTool.ERASER}
        handleClick={() => {
          changeBrushTool(BrushTool.ERASER);
        }}
      >
        <LuEraser color={brushTool === BrushTool.ERASER ? '#fff' : '#000'} />
      </Tool>
      <Tool
        selected={brushTool === BrushTool.PAINT_BUCKET}
        handleClick={() => {
          changeBrushTool(BrushTool.PAINT_BUCKET);
        }}
      >
        <LuPaintBucket color={brushTool === BrushTool.PAINT_BUCKET ? '#fff' : '#000'} />
      </Tool>
      {/* TODO: Implement Select Mode */}
      <Tool
        disabled
        selected={false}
        handleClick={() => {
          return;
        }}
      >
        <PiSelectionPlusBold color={brushTool === BrushTool.SELECT ? '#fff' : '#000'} />
      </Tool>
    </div>
  );
});

export default PaintTools;
