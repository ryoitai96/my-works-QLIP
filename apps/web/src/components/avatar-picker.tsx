'use client';

import { AVATAR_OPTIONS, getAvatarPath } from '@qlip/shared';

interface AvatarPickerProps {
  value: string;
  onChange: (avatarId: string) => void;
}

export function AvatarPicker({ value, onChange }: AvatarPickerProps) {
  return (
    <div role="radiogroup" aria-label="アバターを選択" className="grid grid-cols-5 gap-3">
      {AVATAR_OPTIONS.map((opt) => {
        const selected = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={opt.label}
            onClick={() => onChange(opt.id)}
            className={`flex flex-col items-center gap-1 rounded-xl p-2 transition-all ${
              selected
                ? 'border-2 border-[#ffc000] bg-[#ffc000]/10 shadow-sm'
                : 'border-2 border-transparent hover:border-gray-200 hover:bg-gray-50'
            }`}
          >
            <img
              src={getAvatarPath(opt.id)}
              alt={opt.label}
              width={56}
              height={56}
              className="rounded-full"
            />
            <span className="text-xs text-gray-600">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
