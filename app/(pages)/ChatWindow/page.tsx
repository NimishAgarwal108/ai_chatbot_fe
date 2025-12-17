import FirstWindow from "@/components/custom/FirstWindow";
import NavBar from "@/components/custom/NavBar";

export default function Page() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">

      {/* Sidebar - NavBar handles its own responsive behavior */}
      <NavBar />

      {/* Main Content */}
      <section className="flex-1 overflow-hidden">
        <FirstWindow />
      </section>

    </div>
  );
}
