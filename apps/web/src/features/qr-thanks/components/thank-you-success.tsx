'use client';

export function ThankYouSuccess() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 text-6xl" role="img" aria-label="花束">
        💐
      </div>
      <h2 className="mb-3 text-2xl font-bold text-gray-900">
        感謝が届きました！
      </h2>
      <p className="max-w-sm text-base leading-relaxed text-gray-600">
        あなたの「ありがとう」が
        <br />
        作り手に届きます。
        <br />
        温かいお気持ちをありがとうございます。
      </p>
    </div>
  );
}
