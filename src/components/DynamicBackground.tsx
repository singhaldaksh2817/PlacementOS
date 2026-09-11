export default function DynamicBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none -z-50 transition-colors duration-500"
      style={{ backgroundColor: 'var(--bg-main)' }}
      aria-hidden="true"
    />
  );
}
