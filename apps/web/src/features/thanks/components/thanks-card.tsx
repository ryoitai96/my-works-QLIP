import { getCategoryByValue } from '../categories';
import type { ThanksCard as ThanksCardType } from '../api';

interface ThanksCardProps {
  card: ThanksCardType;
}

export function ThanksCard({ card }: ThanksCardProps) {
  const cat = getCategoryByValue(card.category);
  const borderColor = cat?.borderColor ?? 'border-gray-200';
  const bgColor = cat?.bgColor ?? 'bg-white';
  const badgeBg = cat?.badgeBgColor ?? 'bg-gray-100';
  const badgeText = cat?.badgeTextColor ?? 'text-gray-700';
  const emoji = cat?.emoji ?? '';
  const label = cat?.label ?? card.category;

  const date = new Date(card.createdAt);
  const formatted = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;

  return (
    <article
      className={`rounded-xl border-2 ${borderColor} ${bgColor} p-4 transition-shadow hover:shadow-md`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeBg} ${badgeText}`}
        >
          <span aria-hidden="true">{emoji}</span>
          {label}
        </span>
        <time dateTime={card.createdAt} className="text-xs text-gray-400">
          {formatted}
        </time>
      </div>

      <p className="mb-3 text-sm leading-relaxed text-gray-800">
        {card.content}
      </p>

      <p className="text-xs text-gray-500">
        From:{' '}
        <span className="font-medium text-gray-700">
          {card.isQrThanks
            ? card.senderDisplayName || 'QRサンクス'
            : card.fromUser?.name ?? '匿名'}
        </span>
        {card.isQrThanks && (
          <span className="ml-1.5 inline-flex items-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
            QR
          </span>
        )}
      </p>
    </article>
  );
}
