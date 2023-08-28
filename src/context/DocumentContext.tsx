import React, { createContext, useContext, useState } from 'react';
import { ActorID, Indexable } from 'yorkie-js-sdk';
import { Peer } from '../types/document';

type DocumentContextType = {
  currentClient: Peer;
  peersExceptCurrentClient: Peer[];
  syncPeers: ({
    myClientID,
    changedPeers,
  }: {
    myClientID?: ActorID | null;
    changedPeers?: Array<{ clientID: string; presence: Indexable }>;
  }) => void;
};

const DocumentContext = createContext<DocumentContextType | null>({
  currentClient: {} as Peer,
  peersExceptCurrentClient: [],
  syncPeers: ({}) => {},
});

function DocumentProvider({ children }: { children: React.ReactNode }) {
  const [currentClient, setCurrentClient] = useState<Peer>({} as Peer);
  const [peersExceptCurrentClient, setPeersExceptCurrentClient] = useState<Peer[]>([]);

  const syncPeers = ({
    myClientID,
    changedPeers,
  }: {
    myClientID: ActorID;
    changedPeers: Array<{ clientID: string; presence: Indexable }>;
  }) => {
    if (!changedPeers) return;

    const currentClient = changedPeers.find((peer) => peer.clientID === myClientID);
    const peers = changedPeers.filter((peer) => peer.clientID !== myClientID);
    setCurrentClient(currentClient);
    setPeersExceptCurrentClient(peers);
  };

  return (
    <DocumentContext.Provider
      value={{
        currentClient,
        peersExceptCurrentClient,
        syncPeers,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
}

export const useDocumentContext = () => useContext(DocumentContext);

export default DocumentProvider;
