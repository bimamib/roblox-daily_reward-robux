export default function Loading() {
  return (
    <main
      className="page-loading"
      role="status"
      aria-live="polite"
      aria-label="Memuat halaman"
    >
      <div className="page-spinner" />
    </main>
  );
}
