import { useMemo, useState } from 'react';
import { Peer } from '../types/document';
import { LiaHeadsetSolid } from 'react-icons/lia';
import ClientInfoDropdown from './ClientInfoDropdown';

interface PeersProps {
  user?: Peer;
  peers?: Peer[];
}

export default function Peers({ user, peers }: PeersProps) {
  const ICON_CLASS = 'w-6 h-6 mr-2 mt-1 text-gray-800';
  const PEER_STYLE_CLASS = 'w-9 h-9 rounded-full pt-0.5 relative';
  const PEER_FONT_STYLE_CLASS = 'font-bold text-xl text-white';
  const PEER_DISPLAY_CLASS = 'flex items-center justify-center';
  const PEERS_CONTAINER_CLASS =
    'flex items-center gap-1 w-auto h-auto max-w-2xl absolute top-1 right-1 ' +
    'rounded-xl py-2 px-3 bg-white border-2 border-stone-600 shadow-lg';

  const currentClientName = useMemo(() => {
    return user?.presence?.initialPresence?.username;
  }, [user]);

  const [hoveredPeer, setHoveredPeer] = useState<string | null>(null);

  console.log(hoveredPeer);

  return (
    <div className={PEERS_CONTAINER_CLASS}>
      <LiaHeadsetSolid className={ICON_CLASS} />

      <div key={user?.clientID}>
        <span
          style={{ backgroundColor: user?.presence?.initialPresence?.color ?? 'transparent' }}
          className={`${PEER_DISPLAY_CLASS} ${PEER_STYLE_CLASS} ${PEER_FONT_STYLE_CLASS}`}
          onMouseEnter={() => {
            setHoveredPeer(user?.clientID);
          }}
          onMouseLeave={() => {
            setHoveredPeer(null);
          }}
        >
          {hoveredPeer === user?.clientID && (
            <ClientInfoDropdown name={currentClientName} isCurrentClient />
          )}
          {currentClientName && currentClientName[0]}
        </span>
      </div>

      {peers?.map((peer) => (
        <div key={peer?.clientID}>
          <span
            style={{ backgroundColor: peer?.presence?.initialPresence?.color }}
            className={`${PEER_DISPLAY_CLASS} ${PEER_STYLE_CLASS} ${PEER_FONT_STYLE_CLASS}`}
            onMouseEnter={() => {
              setHoveredPeer(peer?.clientID);
            }}
            onMouseLeave={() => {
              setHoveredPeer(null);
            }}
          >
            {hoveredPeer === peer?.clientID && (
              <ClientInfoDropdown name={peer?.presence?.initialPresence?.username} />
            )}
            {peer?.presence?.initialPresence?.username[0]}
          </span>
        </div>
      ))}
    </div>
  );
}
