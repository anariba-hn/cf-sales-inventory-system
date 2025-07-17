export function Header() {
  return (
    <header className="hidden md:flex justify-between items-center p-4 border-b">
      <h1 className="text-lg font-semibold">App Title</h1>
      <div className="flex items-center gap-4">
        {/* Placeholder for avatar or user menu */}
        <div className="w-8 h-8 rounded-full bg-gray-300" />
      </div>
    </header>
  );
}
