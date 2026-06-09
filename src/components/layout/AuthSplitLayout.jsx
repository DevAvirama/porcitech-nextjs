export default function AuthSplitLayout({ children, showcase }) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#09090b]">
      <div className="flex items-center justify-center p-6 sm:p-12 md:p-16">
        <div className="w-full max-w-md space-y-8">
          {children}
        </div>
      </div>
      <div className="hidden lg:block relative overflow-hidden bg-zinc-950 border-l border-zinc-900">
        {showcase}
      </div>
    </div>
  );
}
