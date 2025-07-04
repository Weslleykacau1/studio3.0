import ScriptifyStudio from "@/components/scriptify-studio";

export default function Home() {
  const isApiConfigured = !!process.env.GEMINI_API_KEY;

  return (
    <main
      className="flex min-h-screen flex-col bg-background p-4 font-sans text-foreground sm:p-6 lg:p-8"
      suppressHydrationWarning
    >
      <div className="container mx-auto flex-grow" suppressHydrationWarning>
        <ScriptifyStudio isApiConfigured={isApiConfigured} />
      </div>
      <footer className="py-4 text-center text-sm text-muted-foreground">
        By Weslley Athila
      </footer>
    </main>
  );
}
