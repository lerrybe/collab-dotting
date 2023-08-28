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
import Peers from '../components/Peers';
import Palette from '../components/Palette';
import PaintTools from '../components/PaintTools';
import ControlTools from '../components/ControlTools';
import { CreateInitialDataArray } from '../utils/data';
import { useDottingContext } from '../context/DottingContext';
import { useDocumentContext } from '../context/DocumentContext';
import { CONTROLLER_CLASS, LOGO_CLASS, MAIN_CLASS } from '../styles/styleClass';

import LogoImage from '../assets/logo.svg';

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

  /* Subscribe from yorkie remote (document data) */
  useEffect(() => {
    if (!isMultiplayerReady) return;

    const subscribe = doc.subscribe((event: DocEvent) => {
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

    return () => {
      subscribe();
    };
  }, [doc, client, isMultiplayerReady]);

  /* Subscribe from yorkie remote (peer info) */
  useEffect(() => {
    if (!client || !doc) {
      return () => {};
    }
    const updatePeers = () => {
      const users = doc?.getPresences();
      if (users) {
        syncPeers({ myClientID: client.getID(), changedPeers: users });
      }
    };
    const subscribe = doc.subscribe('presence', (event) => {
      if (event.type === 'initialized') {
        updatePeers();
      }
      if (event.type === 'watched') {
        updatePeers();
      }
      if (event.type === 'unwatched') {
        updatePeers();
      }
      if (event.type === 'presence-changed') {
        updatePeers();
      }
    });
    return () => {
      subscribe();
    };
  }, [client, doc]);

  return (
    <main className={MAIN_CLASS}>
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

      <div className={CONTROLLER_CLASS}>
        <Menu ref={ref} />
        <Palette ref={ref} />
        <PaintTools ref={ref} />
        <ControlTools ref={ref} undo={undoData} redo={redoData} clear={clearData} />
      </div>

      <Peers user={currentClient} peers={peersExceptCurrentClient} />

      <div className={LOGO_CLASS}>
        <img src={LogoImage} alt='logo' className='w-full h-full' />
      </div>
    </main>
  );
}
