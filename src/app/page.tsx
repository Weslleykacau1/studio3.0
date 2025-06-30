import ScriptifyStudio from "@/components/scriptify-studio";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans text-gray-800 dark:bg-background dark:text-foreground sm:p-6 lg:p-8">
      <div className="container mx-auto">
        <ScriptifyStudio />
      </div>
    </div>
  );
}
