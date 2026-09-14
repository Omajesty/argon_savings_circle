export default function Footer() {
  return (
    <footer className="bg-navy-deep text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-5 py-16 text-center">
        <div className="flex items-center gap-2">
          <img src="/fav.png" alt="" className="h-9 w-9" />
          <span className="text-xl font-semibold">Ajo</span>
        </div>
        <p className="max-w-md text-sm text-white/60">
          Weekly savings circles for people who are tired of doing the
          arithmetic in a notebook.
        </p>
        <p className="text-xs text-white/40">© 2026 Ajo. All rights reserved.</p>
      </div>
    </footer>
  );
}
