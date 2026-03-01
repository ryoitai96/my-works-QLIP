import { ROLE_LABELS } from '@qlip/shared';

export default function Home() {
  const roles = Object.entries(ROLE_LABELS);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">QLIP</h1>
      <p className="text-lg text-gray-600 mb-8">HR-ESG Platform — Phase 0 PoC</p>

      <section className="w-full max-w-md">
        <h2 className="text-xl font-semibold mb-3">User Roles</h2>
        <ul className="space-y-2">
          {roles.map(([id, label]) => (
            <li key={id} className="flex items-center gap-3 p-2 rounded bg-gray-50">
              <span className="text-sm font-mono text-gray-500">{id}</span>
              <span>{label}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
