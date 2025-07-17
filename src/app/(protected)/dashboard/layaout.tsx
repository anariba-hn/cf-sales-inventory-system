export default async function CFLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {/* Header */}
      <div>{children}</div>
    </div>
  );
}
