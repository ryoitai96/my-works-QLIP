'use client';

import { useRef } from 'react';

import { ThanksForm } from './thanks-form';
import { ThanksList, type ThanksListHandle } from './thanks-list';

export function ThanksPageContent() {
  const listRef = useRef<ThanksListHandle>(null);

  return (
    <div className="space-y-8">
      <ThanksForm onSent={() => listRef.current?.reload()} />

      <section aria-labelledby="received-thanks-heading">
        <h2
          id="received-thanks-heading"
          className="mb-4 text-lg font-semibold text-gray-900"
        >
          届いた感謝
        </h2>
        <ThanksList ref={listRef} />
      </section>
    </div>
  );
}
