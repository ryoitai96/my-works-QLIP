'use client';

import { getAvatarPath } from '@qlip/shared';

const SIZE_MAP = {
  sm: 32,
  md: 48,
  lg: 96,
} as const;

interface MemberAvatarProps {
  avatarId: string | null | undefined;
  size?: keyof typeof SIZE_MAP;
  className?: string;
}

export function MemberAvatar({ avatarId, size = 'md', className = '' }: MemberAvatarProps) {
  const px = SIZE_MAP[size];
  const src = getAvatarPath(avatarId || 'avatar-01');

  return (
    <img
      src={src}
      alt="アバター"
      width={px}
      height={px}
      className={`shrink-0 rounded-full ${className}`}
    />
  );
}
