'use client';

import dynamic from 'next/dynamic';

const ChatPage = dynamic(() => import('./chat/client').then(m => m.default), { ssr: false });

export default function Page() {
  return <ChatPage />;
}
