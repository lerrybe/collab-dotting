import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DocEvent } from 'yorkie-js-sdk';
import {
  Dotting,
  useData,
  useDotting,
  useHandlers,
  DottingRef,
  PixelModifyItem,
  ColorChangeItem,
} from 'dotting';

import usePeer from '../hooks/usePeer';
import Menu from '../components/Menu';
import Palette from '../components/Palette';
import PaintTools from '../components/PaintTools';
import ControlTools from '../components/ControlTools';
import { CreateInitialDataArray } from '../utils/data';
import { useDottingContext } from '../context/DottingContext';
import { useDocumentContext } from '../context/DocumentContext';

import LogoImage from '../assets/logo.svg';
import Peers from '../components/Peers';

export default function Document() {
  /* Document Id */
  const { docId } = useParams<{ docId: string }>();

  /* Dotting */
  const ref = useRef<DottingRef>(null);
  const { dataArray } = useData(ref);
  const { colorPixels, setData, undo, redo, clear } = useDotting(ref);
  const { addStrokeEndListener, removeStrokeEndListener } = useHandlers(ref);

  /* Get data from hook */
  const { isGridFixed, isGridVisible, isPanZoomEnable } = useDottingContext();
  const { doc, client, isMultiplayerReady } = usePeer({ docId, dataArray, setData });

  /* Manage History */
  const [undoHistory, setUndoHistory] = useState<ColorChangeItem[][]>([]);
  const [redoHistory, setRedoHistory] = useState<ColorChangeItem[][]>([]);

  /* Manage Peer */
  const { currentClient, peersExceptCurrentClient, syncPeers } = useDocumentContext();

  /* Undo */
  const undoData = useCallback(() => {
    if (!undoHistory) return;

    undo();

    doc?.update((root) => {
      const history = undoHistory.pop();
      if (!history) return;

      setRedoHistory([...redoHistory.map((items) => [...items]), history]);
      history?.forEach((item) => {
        const { color, rowIndex, columnIndex, previousColor } = item;
        root.data[rowIndex][columnIndex].color = previousColor;
      });
    });
  }, [dataArray]);

  /* Redo */
  const redoData = useCallback(() => {
    if (!redoHistory) return;

    redo();

    doc?.update((root) => {
      const history = redoHistory.pop();
      if (!history) return;

      setUndoHistory([...undoHistory.map((items) => [...items]), history]);
      history?.forEach((item) => {
        const { color, rowIndex, columnIndex, previousColor } = item;
        root.data[rowIndex][columnIndex].color = color;
      });
    });
  }, [dataArray]);

  /* Clear */
  const clearData = useCallback(() => {
    if (!confirm('Are you sure you want to clear the canvas and all history?')) return;

    clear();
    doc?.update((root) => {
      setUndoHistory([]);
      setRedoHistory([]);

      dataArray?.forEach((row) => {
        row.forEach(({ rowIndex, columnIndex }) => {
          root.data[rowIndex][columnIndex].color = '';
        });
      });
    });
  }, [dataArray]);

  /* Update to yorkie remote */
  useEffect(() => {
    const updateData = ({ strokedPixels }) => {
      setUndoHistory([...undoHistory.map((items) => [...items]), strokedPixels]);

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
  }, [doc, addStrokeEndListener, removeStrokeEndListener, dataArray]);

  /* Subscribe from yorkie remote */
  useEffect(() => {
    if (!isMultiplayerReady) return;

    doc.subscribe((event: DocEvent) => {
      if (event.type === 'remote-change') {
        const { message, operations } = event.value;
        const pixelsToColor: PixelModifyItem[] = [];
        for (const op of operations) {
          const { path } = op;
          const parsedPath = path.split('.');
          if (parsedPath.length < 4) continue; // VALIDATION: include $, data, rowIndex, columnIndex

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

  /* Unsubscribe from yorkie remote */
  useEffect(() => {
    if (!client || !doc) {
      return () => {};
    }
    const subscribe = doc.subscribe('others', (event) => {
      if (event.type === 'initialized') {
        const users = doc?.getPresences();
        if (users) {
          syncPeers({ myClientID: client.getID(), changedPeers: users });
        }
      } else if (event.type === 'presence-changed') {
        const users = doc.getPresences();
        if (users) {
          syncPeers({ myClientID: client.getID(), changedPeers: users });
        }
      }
    });
    return () => {
      subscribe();
    };
  }, [client, doc]);

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
        initLayers={[
          {
            id: 'layer1',
            data: CreateInitialDataArray(40),
          },
        ]}
      />
      <div className='flex flex-col gap-2 absolute top-1 left-1'>
        <Menu ref={ref} />
        <Palette ref={ref} />
        <PaintTools ref={ref} />
        <ControlTools ref={ref} undo={undoData} redo={redoData} clear={clearData} />
      </div>

      <div className='absolute top-1 right-1'>
        <Peers user={currentClient} peers={peersExceptCurrentClient} />
      </div>

      <div className='absolute bottom-2 right-2 w-20 h-20 rounded-[300px] bg-white shadow-2xl'>
        <img src={LogoImage} alt='logo' className='w-full h-full' />
      </div>
    </main>
  );
}
