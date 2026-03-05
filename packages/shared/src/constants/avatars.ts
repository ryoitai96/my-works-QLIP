export interface AvatarOption {
  id: string;
  label: string;
  color: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: 'avatar-01', label: 'ねこ', color: '#FFB6C1' },
  { id: 'avatar-02', label: 'いぬ', color: '#87CEEB' },
  { id: 'avatar-03', label: 'うさぎ', color: '#DDA0DD' },
  { id: 'avatar-04', label: 'くま', color: '#F4A460' },
  { id: 'avatar-05', label: 'ぱんだ', color: '#98FB98' },
  { id: 'avatar-06', label: 'ひよこ', color: '#FFD700' },
  { id: 'avatar-07', label: 'ぺんぎん', color: '#ADD8E6' },
  { id: 'avatar-08', label: 'きつね', color: '#FFA07A' },
  { id: 'avatar-09', label: 'こあら', color: '#C0C0C0' },
  { id: 'avatar-10', label: 'りす', color: '#DEB887' },
];

export function getAvatarPath(avatarId: string): string {
  return `/avatars/${avatarId}.svg`;
}
