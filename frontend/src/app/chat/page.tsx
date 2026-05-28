'use client';

import dynamic from 'next/dynamic';

const ChatPage = dynamic(() => import('./client'), { ssr: false });

export default ChatPage;