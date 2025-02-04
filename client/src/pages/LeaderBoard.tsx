import Footer from "@/components/Footer.tsx";
import Header from "../components/Header.tsx";
import SideBar from "@/components/SideBar.tsx";
import LeaderBoardComponent from "../components/LeaderBoardComponent";

function LeaderBoard() {




  return (
    <>
      <Header />
      <div className="grid grid-cols-[auto,1fr] h-screen overflow-auto bg-zinc-50 dark:bg-teal-950">
        {/* Sidebar */}
        <div className="h-full flex-none">
          <SideBar />
        </div>
        <LeaderBoardComponent />
      </div>
      <Footer/>
    </>
  );
}

export default LeaderBoard;
