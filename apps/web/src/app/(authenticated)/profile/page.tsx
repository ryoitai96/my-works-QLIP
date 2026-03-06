import { MyProfileContent } from '../../../features/members/components/my-profile-content';

export const metadata = { title: 'マイプロフィール | QLIP' };

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-xl font-bold text-gray-900">マイプロフィール</h1>
      <MyProfileContent />
    </div>
  );
}
