import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { DocEvent } from 'yorkie-js-sdk';
import { Dotting, useData, useDotting, useHandlers, DottingRef, PixelModifyItem } from 'dotting';

import usePeer from '../hooks/usePeer.js';
import { useDottingContext } from '../context/DottingContext.tsx';

import LogoImage from '../assets/logo.svg';
import Menu from '../components/Menu.tsx';
import Palette from '../components/Palette.tsx';
import PaintTools from '../components/PaintTools.js';
import ControlTools from '../components/ControlTools.js';
import { initialDataArray } from '../data/initialData.js';

export default function Document() {
  /* Document Id */
  const { docId } = useParams<{ docId: string }>();

  /* Dotting */
  const ref = useRef<DottingRef>(null);
  const { dataArray } = useData(ref);
  const { colorPixels, setData } = useDotting(ref);
  const { addStrokeEndListener, removeStrokeEndListener } = useHandlers(ref);

  /* Get data from hook */
  const { isGridFixed, isGridVisible, isPanZoomEnable } = useDottingContext();
  const { doc, client, isMultiplayerReady } = usePeer({ docId, dataArray, setData });

  useEffect(() => {
    const updateData = ({ strokedPixels }) => {
      doc?.update((root) => {
        strokedPixels?.forEach((item) => {
          const { color, rowIndex, columnIndex } = item;
          root.data[rowIndex][columnIndex].color = color;
        });
      });
    };
    addStrokeEndListener(updateData);
    return () => {
      removeStrokeEndListener(updateData);
    };
  }, [doc, addStrokeEndListener, removeStrokeEndListener]);

  useEffect(() => {
    if (!isMultiplayerReady) return;

    doc.subscribe((event: DocEvent) => {
      if (event.type === 'remote-change') {
        const { message, operations } = event.value;
        const pixelsToColor: Array<PixelModifyItem> = [];
        for (const op of operations) {
          const { path } = op;
          const parsedPath = path.split('.');
          const rowIndex = parsedPath[parsedPath.length - 2];
          const columnIndex = parsedPath[parsedPath.length - 1];
          const color = doc.getRoot().data[rowIndex][columnIndex].color;
          pixelsToColor.push({
            color,
            rowIndex: Number(rowIndex),
            columnIndex: Number(columnIndex),
          });
        }
        colorPixels(pixelsToColor);
      }
    });
  }, [doc, client, isMultiplayerReady]);

  return (
    <main className='relative'>
      <Dotting
        ref={ref}
        width={'100vw'}
        height={'100vh'}
        style={{ border: 'none' }}
        isGridFixed={isGridFixed}
        isGridVisible={isGridVisible}
        isPanZoomable={isPanZoomEnable}
        initData={initialDataArray}
      />

      <div className='flex flex-col gap-2 absolute top-1 left-1'>
        <Menu ref={ref} />
        <Palette ref={ref} />
        <PaintTools ref={ref} />
        <ControlTools ref={ref} />
      </div>

      <div className='absolute bottom-2 right-2 w-20 h-20 rounded-[300px] bg-white shadow-2xl'>
        <img src={LogoImage} alt='logo' className='w-full h-full' />
      </div>
    </main>
  );
}
