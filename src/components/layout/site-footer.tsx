export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200">
      <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-neutral-500">
        © {new Date().getFullYear()} Kodeva
      </div>
    </footer>
  );
}
