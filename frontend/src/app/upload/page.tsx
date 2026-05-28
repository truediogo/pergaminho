'use client';

import dynamic from 'next/dynamic';

const UploadPageClient = dynamic(() => import('./client'), { ssr: false });

export default UploadPageClient;
