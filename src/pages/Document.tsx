import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { DottingDoc } from '../types/document.js';
import { initialDataArray, initialIndices } from '../data/initialData.js';
import { activateClient, attachDocument, createDocument } from '../utils/document.js';

import yorkie, { DocEvent, Indexable, JSONArray } from 'yorkie-js-sdk';
import { Dotting, useData, useDotting, useHandlers, DottingRef, PixelModifyItem } from 'dotting';

export default function Document() {
  /* DOCUMENT ID */
  const { docId } = useParams<{ docId: string }>();

  /* DOTTING */
  const ref = useRef<DottingRef>(null);
  const { dataArray } = useData(ref);
  const { colorPixels, setData } = useDotting(ref);
  const { addStrokeEndListener, removeStrokeEndListener } = useHandlers(ref);

  /* YORKIE */
  const [doc, setDoc] = useState<yorkie.Document<DottingDoc>>();
  const [client, setClient] = useState<yorkie.Client<Indexable>>();
  const [isMultiplayerReady, setIsMultiplayerReady] = useState<boolean>(false);

  /* LOCAL STATES */
  const isDataLoaded = useMemo(() => {
    return dataArray.length !== 0;
  }, [dataArray]);

  const initializeRemoteData = () => {
    doc?.update((root) => {
      if (!root.indices) {
        root.indices = initialIndices;
      }

      if (!root.data) {
        root.data = {};
        dataArray.forEach((row) => {
          row.forEach(({ rowIndex, columnIndex, color }) => {
            if (!root.data[rowIndex]) {
              root.data[rowIndex] = {};
            }
            if (!root.data[rowIndex][columnIndex]) {
              // @ts-ignore
              root.data[rowIndex][columnIndex] = {};
            }
            root.data[rowIndex][columnIndex].color = color;
            root.data[rowIndex][columnIndex].rowIndex = rowIndex;
            root.data[rowIndex][columnIndex].columnIndex = columnIndex;
          });
        });
      } else {
        const pixelArray: Array<Array<PixelModifyItem>> = [];
        const rawRecord: Record<string, Record<string, PixelModifyItem>> = JSON.parse(
          // @ts-ignore
          root.data.toJSON(),
        );
        Object.values(rawRecord).forEach((record) => {
          pixelArray.push([]);
          Object.values(record).forEach((item) => {
            pixelArray[pixelArray.length - 1].push(item);
          });
        });
        setData(pixelArray);
      }
    }, 'Initialize default Dotting Document fields if not exists');

    client.sync();
    setIsMultiplayerReady(true);
  };

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
  }, [addStrokeEndListener, removeStrokeEndListener, doc]);

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
  }, [isMultiplayerReady, client, doc]);

  useEffect(() => {
    activateClient().then((client) => {
      setClient(client);
    });
  }, [docId]);

  useEffect(() => {
    if (!client) return;
    const doc = createDocument(docId);
    setDoc(doc);
  }, [client]);

  useEffect(() => {
    if (!client || !doc) return;
    if (!isDataLoaded) return;

    attachDocument(client, doc).then(() => {
      initializeRemoteData();
    });
  }, [client, doc, isDataLoaded]);

  return (
    <>
      <Dotting
        ref={ref}
        width={'100%'}
        height={'800px'}
        style={{ border: 'none' }}
        initData={initialDataArray}
      />
    </>
  );
}
