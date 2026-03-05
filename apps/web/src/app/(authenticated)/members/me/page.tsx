import { MyProfileContent } from '../../../../features/members/components/my-profile-content';

export default function MyProfilePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-xl font-bold text-gray-900">マイページ</h1>
      <MyProfileContent />
    </div>
  );
}
