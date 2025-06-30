import ScriptifyStudio from "@/components/scriptify-studio";

export default function Home() {
  return (
    <main
      className="min-h-screen bg-background p-4 font-sans text-foreground sm:p-6 lg:p-8"
      suppressHydrationWarning
    >
      <div className="container mx-auto" suppressHydrationWarning>
        <ScriptifyStudio />
      </div>
    </main>
  );
}
