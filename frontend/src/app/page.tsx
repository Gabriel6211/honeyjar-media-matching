import Chat from "@/components/Chat";

export default function Home() {
  return (
    <div className="flex h-screen flex-col bg-white">
      <header className="border-b border-zinc-100 px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-500">
            H
          </div>
          <div>
            <h1 className="text-sm font-semibold text-zinc-800">
              HoneyJar
            </h1>
            <p className="text-xs text-zinc-400">
              Media Matching
            </p>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <Chat />
      </main>
    </div>
  );
}
