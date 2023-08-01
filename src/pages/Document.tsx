import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { DottingDoc } from '../types/document.js';
import { initialDataArray, initialIndices } from '../data/initialData.js';

import yorkie, { DocEvent, Indexable, JSONArray } from 'yorkie-js-sdk';
import { Dotting, useData, useDotting, useHandlers, DottingRef, PixelModifyItem } from 'dotting';

// 🚨 TODO: Splitting the code into functional units.

export default function Document() {
  /* DOCUMENT ID */
  const { docId } = useParams<{ docId: string }>();

  /* YORKIE */
  const [doc, setDoc] = useState<yorkie.Document<DottingDoc>>();
  const [client, setClient] = useState<yorkie.Client<Indexable>>();
  const [isMultiplayerReady, setIsMultiplayerReady] = useState<boolean>(false);

  /* DOTTING */
  const ref = useRef<DottingRef>(null);
  const { addStrokeEndListener, removeStrokeEndListener } = useHandlers(ref);
  const { data, dataArray } = useData(ref);
  const { colorPixels, setData } = useDotting(ref);

  /* LOCAL STATES */
  const isDataLoaded = useMemo(() => {
    return dataArray.length !== 0;
  }, [dataArray]);

  // TODO data 로딩학 때까지는 보이지 않게

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

  const activateClient = async () => {
    const client = new yorkie.Client(import.meta.env.VITE_YORKIE_API_ADDR, {
      apiKey: import.meta.env.VITE_YORKIE_API_KEY,
    });
    await client.activate();
    return client;
  };

  const createDocument = () => {
    return new yorkie.Document<DottingDoc>(docId);
  };
  //
  const attachDocument = async () => {
    await client.attach(doc);
  };
  //
  // // isDataLoaded
  //
  const initializeRemoteData = () => {
    doc?.update((root) => {
      console.log(dataArray, 'dataArray');

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
            root.data[rowIndex][columnIndex].rowIndex = rowIndex;
            root.data[rowIndex][columnIndex].columnIndex = columnIndex;
            root.data[rowIndex][columnIndex].color = color;
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
      if (!root.indices) {
        root.indices = initialIndices;
      }
    }, 'Initialize default Dotting Document fields if not exists');
    client.sync();
    setIsMultiplayerReady(true);
  };

  useEffect(() => {
    if (!isMultiplayerReady) {
      return;
    }
    console.log('isMultiplayerReady', isMultiplayerReady);
    doc.subscribe((event: DocEvent) => {
      if (event.type === 'remote-change') {
        const { message, operations } = event.value;
        const pixelsToColor: Array<PixelModifyItem> = [];
        for (const op of operations) {
          const { path } = op;
          const parsedPath = path.split('.');
          const columnIndex = parsedPath[parsedPath.length - 1];
          const rowIndex = parsedPath[parsedPath.length - 2];
          const color = doc.getRoot().data[rowIndex][columnIndex].color;
          pixelsToColor.push({
            rowIndex: Number(rowIndex),
            columnIndex: Number(columnIndex),
            color,
          });

          console.log(rowIndex, columnIndex, color);
        }
        colorPixels(pixelsToColor);
      }
      const target = doc.getValueByPath('$.data') as JSONArray<PixelModifyItem>;

      console.log(target, 'target');
    });
    // const unsubscribeData = doc.subscribe('$.data', (event) => {
    //   const target = doc.getValueByPath('$.data');
    //   console.log(target, 'target');
    // });
    return () => {
      // unsubscribe();
    };
  }, [isMultiplayerReady, client, doc]);

  useEffect(() => {
    activateClient().then((client) => {
      console.log('activated client');
      setClient(client);
    });
  }, [docId]);

  useEffect(() => {
    if (!client) return;
    console.log('creating document!');
    const doc = createDocument();
    setDoc(doc);
  }, [client]);

  useEffect(() => {
    if (!client || !doc) return;
    console.log('doc and client initialized!');
    if (!isDataLoaded) {
      return;
    }
    console.log('data is loaded!@');
    attachDocument().then(() => {
      initializeRemoteData();
      console.log('attach document successful!');
    });
  }, [client, doc, isDataLoaded]);

  // // TODO: Loading

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
