import { Peer } from '../types/document';

interface PeersProps {
  user?: Peer;
  peers?: Peer[];
}

export default function Peers({ user, peers }: PeersProps) {
  return (
    <div className='w-auto max-w-2xl flex overflow-x-auto gap-2'>
      <ul className='flex gap-2'>
        <div
          style={{ backgroundColor: user?.presence?.initialPresence?.color }}
          className='w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl'
        >
          {user?.presence?.initialPresence?.username[0]}
        </div>
        {peers?.map((peer) => (
          <div
            key={peer?.clientID}
            className='w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl'
            style={{ backgroundColor: peer?.presence?.initialPresence?.color }}
          >
            {peer?.presence?.initialPresence?.username[0]}
          </div>
        ))}
      </ul>
    </div>
  );
}
