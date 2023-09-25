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
  // const [dataDelta, setDataDelta] = useState<CanvasDelta | null>(null);
  const ref = useRef<DottingRef>(null);
  const { dataArray } = useData(ref);
  const { addDataChangeListener, removeDataChangeListener } = useHandlers(ref);
  const { clear, setData, colorPixels, addGridIndices, deleteGridIndices } = useDotting(ref);

  /* Get data from hook */
  const { isGridFixed, isGridVisible, isPanZoomEnable } = useDottingContext();
  const { doc, client, isMultiplayerReady } = usePeer({ docId, dataArray, setData });

  /* Manage Peer */
  const { currentClient, peersExceptCurrentClient, syncPeers } = useDocumentContext();

  /* Clear */
  const clearData = useCallback(() => {
    if (!confirm('Are you sure you want to clear the canvas and all histories?')) return;
    clear();
    doc?.update((root) => {
      dataArray?.forEach((row) => {
        row.forEach(({ rowIndex, columnIndex }) => {
          root.data[rowIndex][columnIndex].color = '';
        });
      });
    });
  }, [dataArray]);

  // if (doc) {
  //   if (doc?.getRoot()) {
  //     if (doc?.getRoot()?.data) {
  //       // @ts-ignore
  //       const target = JSON.parse(doc.getRoot().data.toJSON());
  //       if (target.hasOwnProperty('0')) {
  //         if (target['0'].hasOwnProperty('0')) {
  //           console.log('진입은함');
  //           delete doc?.getRoot()?.data['0'];
  //         }
  //       }
  //     }
  //   }
  // }

  /* Update to yorkie remote */
  useEffect(() => {
    const handleDataChangeHandler: CanvasDataChangeHandler = ({ isLocalChange, delta, data }) => {
      doc?.update((root) => {
        if (isLocalChange && delta?.modifiedPixels) {
          delta?.modifiedPixels?.forEach((item) => {
            const { color, rowIndex, columnIndex } = item;
            root.data[rowIndex][columnIndex].color = color;
          });
        }
      });

      /* TODO: Update to yorkie remote */
      doc?.update((root) => {
        // todo: 변경 안된 부분만 체크하기 위한 range 인데 고민
        // const range = {
        //   minimum: { rowIndex: Number.POSITIVE_INFINITY, columnIndex: Number.POSITIVE_INFINITY },
        //   maximum: { rowIndex: Number.NEGATIVE_INFINITY, columnIndex: Number.NEGATIVE_INFINITY },
        // };
        //
        // const rawRecord: Record<string, Record<string, PixelModifyItem>> = JSON.parse(
        //   // @ts-ignore
        //   root.data.toJSON(),
        // );

        // Object.values(rawRecord).forEach((record) => {
        //   Object.values(record).forEach((item) => {
        //     range.minimum.rowIndex = Math.min(range.minimum.rowIndex, item.rowIndex);
        //     range.maximum.rowIndex = Math.max(range.maximum.rowIndex, item.rowIndex);
        //     range.minimum.columnIndex = Math.min(range.minimum.columnIndex, item.columnIndex);
        //     range.maximum.columnIndex = Math.max(range.maximum.columnIndex, item.columnIndex);
        //   });
        // }

        if (delta?.addedOrDeletedColumns || delta?.addedOrDeletedRows) {
          if (delta?.addedOrDeletedColumns && delta?.addedOrDeletedColumns.length > 0) {
            const rowKeys = Object.keys(root.data);
            for (let i = 0; i < rowKeys.length; i++) {
              const rowIndex = rowKeys[i];
              const columnKeys = Object.keys(root.data[rowIndex]);
              delta.addedOrDeletedColumns.forEach(({ index, isDelete }) => {
                if (isDelete) {
                  delete root.data[rowIndex][index];
                } else {
                  if (!columnKeys.includes(String(index))) {
                    // @ts-ignore
                    root.data[rowIndex][index] = {};
                    root.data[rowIndex][index].color = '';
                    root.data[rowIndex][index].rowIndex = Number(rowIndex);
                    root.data[rowIndex][index].columnIndex = Number(index);
                  }
                }
              });
            }
          }
          if (delta?.addedOrDeletedRows && delta?.addedOrDeletedRows.length > 0) {
            const rowKeys = Object.keys(root.data);
            const columnKeys = Object.keys(root.data[rowKeys[0]]);
            delta.addedOrDeletedRows.forEach(({ index, isDelete }) => {
              if (isDelete) {
                delete root.data[index];
              } else {
                const rowKeys = Object.keys(root.data);
                if (!rowKeys.includes(String(index))) {
                  root.data[index] = {};
                  for (let i = 0; i < columnKeys.length; i++) {
                    const columnKey = columnKeys[i];
                    // @ts-ignore
                    root.data[index][columnKey] = {};
                    root.data[index][columnKey].color = '';
                    root.data[index][columnKey].rowIndex = Number(index);
                    root.data[index][columnKey].columnIndex = Number(columnKey);
                  }
                }
              }
            });
          }
          // root.addedOrDeletedRows = delta.addedOrDeletedRows;
          // root.addedOrDeletedColumns = delta.addedOrDeletedColumns;
        }

        // todo: yorkie document에 대한 수정 부분
        // 바뀐 배열들 보면서, 만약 추가된 row/column이 있다면, 그 row/column에 대한 데이터를 추가해준다.
        // // 만약 삭제된 row/column이 있다면, 그 row/column에 대한 데이터를 삭제해준다.
        // if (delta?.addedOrDeletedRows) {
        //   delta.addedOrDeletedRows.forEach(({ index: rowIndex, isDelete }) => {
        //     if (!isDelete) {
        //       if (rowIndex < range.minimum.rowIndex || rowIndex > range.maximum.rowIndex) {
        //         root.data[rowIndex] = {};
        //         for (
        //           let columnIndex = range.minimum.columnIndex;
        //           columnIndex <= range.maximum.columnIndex;
        //           columnIndex++
        //         ) {
        //           if (!root.data[rowIndex][columnIndex]) {
        //             // @ts-ignore
        //             root.data[rowIndex][columnIndex] = {};
        //           }
        //           root.data[rowIndex][columnIndex].color = '';
        //           root.data[rowIndex][columnIndex].rowIndex = rowIndex;
        //           root.data[rowIndex][columnIndex].columnIndex = columnIndex;
        //         }
        //       }
        //     } else {
        //       // delete인 경우
        //     }
        //   });
        // }
        // if (delta?.addedOrDeletedColumns) {
        //   delta.addedOrDeletedColumns.forEach(({ index, isDelete }) => {
        //     if (!isDelete) {
        //       // add인 경우
        //     } else {
        //       // delete인 경우
        //     }
        //   });
        // }
      });
    };

    addDataChangeListener(handleDataChangeHandler);
    return () => {
      removeDataChangeListener(handleDataChangeHandler);
    };
  }, [isMultiplayerReady, addDataChangeListener, removeDataChangeListener]);

  /* Subscribe from yorkie remote (document data) */
  useEffect(() => {
    if (!isMultiplayerReady) return;

    const subscribe = doc.subscribe((event: DocEvent) => {
      if (event.type === 'remote-change') {
        console.log('이벤트', event);
        const { message, operations } = event.value;
        const pixelsToColor: PixelModifyItem[] = [];
        console.log('오펄이션들', operations);
        for (const op of operations) {
          const { path } = op;
          const parsedPath = path.split('.');
          // we only have remove operation for grid indices
          if (op.type === 'remove') {
            const isDeleteColumnOperation = parsedPath.length === 3;
            if (isDeleteColumnOperation) {
              const columnIndex = Number(op.key);
              deleteGridIndices({
                columnIndices: [columnIndex],
                rowIndices: [],
              });
            } else {
              // delete row operation
              const rowIndex = Number(op.key);
              deleteGridIndices({
                columnIndices: [],
                rowIndices: [rowIndex],
              });
            }
            continue;
          }
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

        // TODO: subscribe to addedOrDeletedRows, addedOrDeletedColumns
        // todo: 이렇게 따로 getRoot 하지 않고 event.value를 통해 diff를 가져오고 싶은데 operations에서 이게 삭제된 건지 추가된 건지 알 수 없는 것 같다
        /* operations 프린트 한 값 예시
          0: {type: 'set', path: '$', key: 'addedOrDeletedRows'}
          1: {type: 'add', path: '$.addedOrDeletedRows', index: 0}
          2: {type: 'set', path: '$.addedOrDeletedRows.0', key: 'index'}
          3: {type: 'set', path: '$.addedOrDeletedRows.0', key: 'isDelete'}
          4: {type: 'add', path: '$.addedOrDeletedRows', index: 1}
          5: {type: 'set', path: '$.addedOrDeletedRows.1', key: 'index'}
          6: {type: 'set', path: '$.addedOrDeletedRows.1', key: 'isDelete'}
          7: {type: 'add', path: '$.addedOrDeletedRows', index: 2}
          8: {type: 'set', path: '$.addedOrDeletedRows.2', key: 'index'}
          9: {type: 'set', path: '$.addedOrDeletedRows.2', key: 'isDelete'}
          10: {type: 'add', path: '$.addedOrDeletedRows', index: 3}
         */
        // doc?.getRoot()?.addedOrDeletedRows?.forEach(({ index, isDelete }) => {
        //   if (!isDelete) {
        //     addGridIndices({
        //       columnIndices: [],
        //       rowIndices: [index],
        //     });
        //   } else {
        //     deleteGridIndices({
        //       columnIndices: [],
        //       rowIndices: [index],
        //     });
        //   }
        // });
        // doc?.getRoot()?.addedOrDeletedColumns?.forEach(({ index, isDelete }) => {
        //   if (!isDelete) {
        //     addGridIndices({
        //       columnIndices: [index],
        //       rowIndices: [],
        //     });
        //   } else {
        //     deleteGridIndices({
        //       columnIndices: [index],
        //       rowIndices: [],
        //     });
        //   }
        // });
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
        <ControlTools ref={ref} clear={clearData} />
      </div>

      <Peers user={currentClient} peers={peersExceptCurrentClient} />

      <div className={LOGO_CLASS}>
        <img src={LogoImage} alt='logo' className='w-full h-full' />
      </div>
    </main>
  );
}
