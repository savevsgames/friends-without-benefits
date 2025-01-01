import Header from "../components/Header.tsx";
import SideBar from "@/components/SideBar.tsx";

function LeaderBoard() {
  return (
    <>
      <Header />
      <div className="grid grid-cols-[auto,1fr] h-screen overflow-auto bg-zinc-50 dark:bg-teal-950">
        {/* Sidebar */}
        <div className="h-full flex-none">
          <SideBar />
        </div>
      </div>
    </>
  );
}

export default LeaderBoard;
