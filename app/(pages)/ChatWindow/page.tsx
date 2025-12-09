import ChatWindow from "@/components/custom/ChatWindow";
import NavBar from "@/components/custom/NavBar";

export default function Page(){
  return(
    <div className="w-full h-screen flex bg-background overflow-hidden">

      {/* LEFT SIDE — NAVIGATION (1/4 width) */}
      <div className="border-r border-slate-800">
        <NavBar />
      </div>

      {/* RIGHT SIDE — CHAT WINDOW (3/4 width) */}
      <div className="w-4/4">
        <ChatWindow />
      </div>

    </div>
  );
}