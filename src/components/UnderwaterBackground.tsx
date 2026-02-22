/**
 * Full-viewport background using dolphin_background.png from public/images.
 * Gradient overlay keeps dashboard content readable.
 */
export default function UnderwaterBackground() {
  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none z-0 min-h-screen min-w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url("/images/dolphin_background.png")' }}
      aria-hidden
    >
      {/* Dark gradient overlay so dashboard content stays readable */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#0a1628]/75 via-[#0a1628]/50 to-[#0a1628]/80"
        aria-hidden
      />
    </div>
  );
}
