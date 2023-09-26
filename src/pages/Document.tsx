import React, { useCallback, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { DocEvent } from 'yorkie-js-sdk';
import {
  CanvasDataChangeHandler,
  Dotting,
  DottingRef,
  PixelModifyItem,
  useData,
  useDotting,
  useHandlers,
} from 'dotting';
import LogoImage from '../assets/logo.svg';
import useInitialization from '../hooks/useInitialization';
import Menu from '../components/Menu';
import Peers from '../components/Peers';
import Palette from '../components/Palette';
import PaintTools from '../components/PaintTools';
import ControlTools from '../components/ControlTools';
import { CreateInitialDataArray } from '../utils/data';
import { useDottingContext } from '../context/DottingContext';
import { useDocumentContext } from '../context/DocumentContext';
import { CONTROLLER_CLASS, LOGO_CLASS, MAIN_CLASS } from '../styles/styleClass';

export default function Document() {
  /* Document Id */
  const { docId } = useParams<{ docId: string }>();

  /* Dotting */
  const ref = useRef<DottingRef>(null);
  const { dataArray, data: dottingData } = useData(ref);
  const { clear, setData, colorPixels, deleteGridIndices } = useDotting(ref);
  const { addDataChangeListener, removeDataChangeListener } = useHandlers(ref);

  /* Get data from hook */
  const { isGridFixed, isGridVisible, isPanZoomEnable } = useDottingContext();
  const { doc, client, isMultiplayerReady } = useInitialization({ docId, dataArray, setData });

  /* Manage Peer */
  const { currentClient, peersExceptCurrentClient, syncPeers } = useDocumentContext();

  /* Clear */
  const clearData = useCallback(() => {
    if (!confirm('Are you sure you want to clear the canvas and all histories?')) return;
    clear();
    // TODO: when clear, delta will be updated
    // doc?.update((root) => {
    //   dataArray?.forEach((row) => {
    //     row.forEach(({ rowIndex, columnIndex }) => {
    //       root.data[rowIndex][columnIndex].color = '';
    //     });
    //   });
    // });
  }, [dataArray]);

  /* [Update] remote document data */
  useEffect(() => {
    if (!isMultiplayerReady) return;

    const handleDataChangeHandler: CanvasDataChangeHandler = ({ isLocalChange, delta, data }) => {
      /* Update color change */
      doc?.update((root) => {
        if (isLocalChange && delta?.modifiedPixels) {
          delta?.modifiedPixels?.forEach((item) => {
            const { color, rowIndex, columnIndex } = item;
            root.data[rowIndex][columnIndex].color = color;
          });
        }
      });

      /* Update grids */
      doc?.update((root) => {
        if (isLocalChange && (delta?.addedOrDeletedColumns || delta?.addedOrDeletedRows)) {
          if (delta?.addedOrDeletedColumns.length > 0) {
            const rowKeys = Object.keys(root.data);
            for (let i = 0; i < rowKeys.length; i++) {
              const rowIndex = rowKeys[i];
              const columnKeys = Object.keys(root.data[rowIndex]);
              delta.addedOrDeletedColumns.forEach(({ index: columnIndex, isDelete }) => {
                if (isDelete) {
                  delete root.data[rowIndex][columnIndex];
                } else {
                  if (!columnKeys.includes(String(columnIndex))) {
                    // @ts-ignore
                    root.data[rowIndex][columnIndex] = {};
                    root.data[rowIndex][columnIndex].color = '';
                    root.data[rowIndex][columnIndex].rowIndex = Number(rowIndex);
                    root.data[rowIndex][columnIndex].columnIndex = Number(columnIndex);
                  }
                }
              });
            }
          }
          if (delta?.addedOrDeletedRows.length > 0) {
            const rowKeys = Object.keys(root.data);
            const columnKeys = Object.keys(root.data[rowKeys[0]]);
            delta.addedOrDeletedRows.forEach(({ index: rowIndex, isDelete }) => {
              if (isDelete) {
                delete root.data[rowIndex];
              } else {
                const rowKeys = Object.keys(root.data);
                if (!rowKeys.includes(String(rowIndex))) {
                  root.data[rowIndex] = {};
                  for (let i = 0; i < columnKeys.length; i++) {
                    const columnKey = columnKeys[i];
                    // @ts-ignore
                    root.data[rowIndex][columnKey] = {};
                    root.data[rowIndex][columnKey].color = '';
                    root.data[rowIndex][columnKey].rowIndex = Number(rowIndex);
                    root.data[rowIndex][columnKey].columnIndex = Number(columnKey);
                  }
                }
              }
            });
          }
        }
      });
    };

    addDataChangeListener(handleDataChangeHandler);
    return () => {
      removeDataChangeListener(handleDataChangeHandler);
    };
  }, [isMultiplayerReady, addDataChangeListener, removeDataChangeListener]);

  /* [Subscribe] remote document changes */
  useEffect(() => {
    if (!isMultiplayerReady) return;

    const subscribe = doc.subscribe((event: DocEvent) => {
      if (event.type === 'remote-change') {
        const { operations } = event.value;

        const rowsToDelete = [];
        const deletedColumns = [];
        const pixelsToColor: PixelModifyItem[] = [];

        for (const op of operations) {
          const { path } = op;
          const parsedPath = path.split('.');

          if (op.type === 'remove') {
            const isDeleteRowOperation = parsedPath.length === 2;
            const isDeleteColumnOperation = parsedPath.length === 3;

            // Deleting row operation
            if (isDeleteRowOperation) {
              const rowIndex = Number(op.key);
              rowsToDelete.push(rowIndex);
              deleteGridIndices({
                columnIndices: [],
                rowIndices: [rowIndex],
              });
            }

            // Deleting column operation
            if (isDeleteColumnOperation) {
              const columnIndex = Number(op.key);
              if (deletedColumns.length === 0 || !deletedColumns.includes(columnIndex)) {
                deletedColumns.push(columnIndex);
                deleteGridIndices({
                  columnIndices: [columnIndex],
                  rowIndices: [],
                });
              }
            }
          }

          // Coloring operation
          if (op.type === 'set') {
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
        }

        if (pixelsToColor.length > 0) {
          colorPixels(pixelsToColor.filter(({ rowIndex }) => !rowsToDelete.includes(rowIndex)));
        }
      }
    });

    return () => {
      subscribe();
    };
  }, [doc, client, isMultiplayerReady]);

  /* [Subscribe] remote peer changes */
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
        <ControlTools ref={ref} clear={clearData} />
      </div>

      <Peers user={currentClient} peers={peersExceptCurrentClient} />

      <div className={LOGO_CLASS}>
        <a target='_blank' href={'https://github.com/lerrybe/collab-dotting'}>
          <img src={LogoImage} alt='logo' className='w-full h-full' />
        </a>
      </div>
    </main>
  );
}
