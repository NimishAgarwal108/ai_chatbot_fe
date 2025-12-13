import FirstWindow from "@/components/custom/FirstWindow";
import NavBar from "@/components/custom/NavBar";

export default function Page() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">

      {/* Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-slate-500 shrink-0">
        <NavBar />
      </aside>

      {/* Main Content */}
      <section className="flex-1 overflow-hidden">
        <FirstWindow />
      </section>

    </div>
  );
}
