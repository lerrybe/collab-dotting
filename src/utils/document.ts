import yorkie from 'yorkie-js-sdk';
import { DottingDoc } from '../types/document.js';

export const activateClient = async () => {
  const client = new yorkie.Client(import.meta.env.VITE_YORKIE_API_ADDR, {
    apiKey: import.meta.env.VITE_YORKIE_API_KEY,
  });
  await client.activate();
  return client;
};

export const createDocument = (docId) => {
  return new yorkie.Document<DottingDoc>(docId);
};

export const attachDocument = async (client, doc) => {
  await client.attach(doc);
};
