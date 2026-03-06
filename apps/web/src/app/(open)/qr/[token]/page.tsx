'use client';

import { useParams } from 'next/navigation';
import { QrStoryPage } from '../../../../features/qr-thanks/components/qr-story-page';

export default function QrTokenPage() {
  const params = useParams<{ token: string }>();
  return <QrStoryPage token={params.token} />;
}
