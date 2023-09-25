import { useEffect, useMemo, useState } from 'react';
import { PixelModifyItem } from 'dotting';
import anonymous from 'anonymous-animals-gen';
import yorkie, { Client, Document } from 'yorkie-js-sdk';
import randomColor from 'randomcolor';

import { DottingDoc } from '../types/document';

export default function usePeer({ docId, dataArray, setData }) {
  const [doc, setDoc] = useState<Document<DottingDoc>>();
  const [client, setClient] = useState<Client>();
  const [isMultiplayerReady, setIsMultiplayerReady] = useState<boolean>(false);
  const isDataLoaded = useMemo(() => {
    return dataArray.length !== 0;
  }, [dataArray]);

  const activateClient = async () => {
    const client = new yorkie.Client(import.meta.env.VITE_YORKIE_API_ADDR, {
      apiKey: import.meta.env.VITE_YORKIE_API_KEY,
    });
    await client.activate();
    return client;
  };

  const createDocument = (docId) => {
    return new yorkie.Document<DottingDoc>(docId);
  };

  const attachDocument = async (client, doc) => {
    const clientColor = randomColor();
    const { name } = anonymous.generate();

    const initialPresence = {
      username: name,
      color: clientColor,
    };

    await client.attach(doc, {
      initialPresence,
      isRealtimeSync: true,
    });

    doc.update((root, presence) => {
      presence.set({ initialPresence });
    });
  };

  const initializeRemoteData = (dataArray, setData) => {
    doc?.update((root) => {
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

        // 초기 세팅 시 정렬된 상태로 보여주기 위함
        pixelArray.sort((a, b) => a[0].rowIndex - b[0].rowIndex);
        pixelArray.forEach((innerArray) => {
          innerArray.sort((a, b) => a.columnIndex - b.columnIndex);
        });

        setData(pixelArray);
      }
    }, 'Initialize default Dotting Document fields if not exists');

    client.sync();
    setIsMultiplayerReady(true);
  };

  /* Effects for setting document & client & yorkie data */
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
      initializeRemoteData(dataArray, setData);
    });
  }, [client, doc, isDataLoaded]);

  return {
    doc,
    client,
    isMultiplayerReady,
  };
}
