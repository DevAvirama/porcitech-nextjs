export default function AuthSplitLayout({ aside, children }) {
  return (
    <main className="grid min-h-screen bg-slate-950 lg:grid-cols-[1.1fr_0.9fr]">

      <section className="relative hidden overflow-hidden lg:block">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.22),transparent_30%),radial-gradient(circle_at_80%_30%,rgba(250,204,21,0.16),transparent_26%),linear-gradient(180deg,#020617_0%,#0f172a_100%)]"></div>

        <div className="relative flex h-full flex-col justify-center p-10 text-white">
          {aside}
        </div>

      </section>

      <section className="flex items-center justify-center px-6 py-14">
        {children}
      </section>

    </main>
  )
}
