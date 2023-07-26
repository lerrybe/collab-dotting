import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

import {
  convertDottingDataToYorkieData,
  convertYorkieDataToDottingArray,
} from '../utils/typeConverting.js';
import { DottingDoc, Indices } from '../types/document.js';
import { initialDataArray, initialIndices } from '../data/initialData.js';

import {
  Dotting,
  useData,
  useDotting,
  useHandlers,
  DottingRef,
  DottingData,
  PixelModifyItem,
  ColorChangeItem,
} from 'dotting';
import yorkie, { Indexable, JSONArray } from 'yorkie-js-sdk';

export default function Document() {
  /* DOCUMENT ID */
  const { docId } = useParams<{ docId: string }>();

  /* YORKIE */
  const [doc] = useState<yorkie.Document<DottingDoc>>(() => new yorkie.Document<DottingDoc>(docId));
  const [client] = useState<yorkie.Client<Indexable>>(
    () =>
      new yorkie.Client(import.meta.env.VITE_YORKIE_API_ADDR, {
        apiKey: import.meta.env.VITE_YORKIE_API_KEY,
      }),
  );

  /* DOTTING */
  const ref = useRef<DottingRef>(null);
  const {
    addStrokeEndListener,
    addGridChangeListener,
    removeStrokeEndListener,
    removeGridChangeListener,
  } = useHandlers(ref);
  const { data: dottingData } = useData(ref);
  const { colorPixels } = useDotting(ref);

  /* LOCAL STATES */
  const [localData, setLocalData] = useState<DottingData>(dottingData);
  const [loading, setLoading] = useState<boolean>(true);
  const [strokedPixels, setStrokedPixels] = useState<JSONArray<ColorChangeItem>>([]);
  const [initDottingArray, setInitDottingArray] =
    useState<Array<Array<PixelModifyItem>>>(initialDataArray);

  /* ACTIONS For update remote (yorkie) document */
  const actions = {
    updateData: () => {
      doc?.update((root) => {
        // 🚨 TODO: update remote (yorkie) data
        /*
          const updatedData = copyYorkieData(root.data);
          strokedPixels.forEach((item) => {
            const { color, rowIndex, columnIndex } = item;
            updatedData[rowIndex][columnIndex] = { color, rowIndex, columnIndex };
          });
          root.data = updatedData;
        */
      });
    },
    updateStrokedPixels: (strokedPixels: Array<ColorChangeItem>) => {
      doc?.update((root) => {
        root.strokedPixels = strokedPixels;
      });
    },
    updateGrid: (indices: Indices) => {
      doc?.update((root) => {
        root.indices = indices;
      });
    },
    initializeRemoteDocument: async (
      doc?: yorkie.Document<DottingDoc>,
      client?: yorkie.Client<Indexable>,
    ) => {
      if (!doc || !client) return;

      /* 01. create client with RPCAddr(envoy) then activate it. */
      await client.activate();
      /* 02. attach the document into the client. */
      await client.attach(doc);
      /* 03. create default fields if not exists. */
      doc.update((root) => {
        if (!root.strokedPixels && ref?.current) {
          root.strokedPixels = strokedPixels;
        }
        if (!root.data && dottingData) {
          root.data = convertDottingDataToYorkieData(dottingData);
        }
        if (!root.indices) {
          root.indices = initialIndices;
          setInitDottingArray(convertYorkieDataToDottingArray(doc));
        }
      }, 'Initialize default Dotting Document fields if not exists');
    },
  };

  /* HANDLERS for change events */
  const handlers = {
    handleStrokeEnd: ({ strokedPixels }: { strokedPixels: Array<ColorChangeItem> }) => {
      setStrokedPixels(strokedPixels);
      actions.updateStrokedPixels(strokedPixels);
    },
    handleGridChange: ({ indices }: { indices: Indices }) => {
      actions.updateGrid(indices);
    },
  };

  /* EFFECTS */
  useEffect(() => {
    setLocalData(dottingData);
  }, [dottingData]);

  useEffect(() => {
    actions
      .initializeRemoteDocument(doc, client)
      .then((res) => {
        setLoading(false);
      })
      .catch((e) => {
        setLoading(false);
      });
  }, [doc, client, ref, localData]);

  useEffect(() => {
    addStrokeEndListener(handlers.handleStrokeEnd);
    return () => {
      removeStrokeEndListener(handlers.handleStrokeEnd);
    };
  }, [addStrokeEndListener, removeStrokeEndListener]);

  useEffect(() => {
    addGridChangeListener(handlers.handleGridChange);
    return () => {
      removeGridChangeListener(handlers.handleGridChange);
    };
  }, [addGridChangeListener, removeGridChangeListener]);

  /* SUBSCRIBE (Update local & Dotting states) */
  useEffect(() => {
    doc?.subscribe((event) => {
      const strokedPixels = doc.getRoot().strokedPixels;
      if (strokedPixels) {
        strokedPixels?.map((item) => {
          const { color, rowIndex, columnIndex } = item;
          return {
            color,
            rowIndex,
            columnIndex,
          };
        });
        colorPixels(strokedPixels);
      }
    });
  }, [doc, strokedPixels]);

  /* RENDER */
  if (!docId) {
    return <div>docId is required</div>;
  }
  if (!client || !doc) {
    return <div>loading...</div>;
  }

  // TODO: Loading

  return (
    <>
      <Dotting
        ref={ref}
        width={'100%'}
        height={'800px'}
        style={{ border: 'none' }}
        initData={initDottingArray}
      />
    </>
  );
}
