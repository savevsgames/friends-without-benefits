import { useNavigate } from "react-router-dom";
import { useThemeStore } from "@/store";
import { IoMoon } from "react-icons/io5";
import { IoSunny } from "react-icons/io5";

function Landing() {
  const navigate = useNavigate();

  const handleSignUp = () => {
    navigate("/signup");
  };

  const handleLogin = () => {
    navigate("/game");
  };

  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const theme = useThemeStore((state) => state.theme);

  console.log(theme);

  const icon = (theme: string) => {
    if (theme === "light") {
      return <IoSunny style={{ color: "teal" }} />;
    } else {
      return <IoMoon style={{ color: "red" }} />;
    }
  };

  return (
    <main data-mode={theme}>
      <div className="bg-slate-50 dark:bg-neutral-950 h-screen flex overflow-hidden">
        {/* Left Section for Text Content */}
        <div className="w-2/5 flex flex-col justify-center items-start px-12">
          <div className="absolute top-4 left-4 z-10">
            <button
              onClick={() => toggleTheme()}
              className="font-bold tracking-widest px-7 flex flex-row items-center"
            >
              {icon(theme)}
              <span className="text-teal-950 dark:text-slate-50 text-2xl ml-2">
                F
              </span>
              <span className="text-teal-900 dark:text-slate-100 text-1xl self-end ml-1">
                WO
              </span>
              <span className="text-teal-950 dark:text-slate-100 text-2xl ml-1">
                B
              </span>
            </button>
          </div>
          <h3 className="text-lg text-teal-900 dark:text-slate-100 mb-4 tracking-wider">
            Think fast. Spot faster. Win big.
          </h3>
          <h1 className="lg:text-4xl md:text-3xl sm:text-xl font-extrabold text-teal-950 dark:text-slate-50 mb-6 tracking-wide leading-snug">
            FIND OBJECTS USING YOUR CAMERA
          </h1>
          <h2 className="text-lg text-teal-900  dark:text-slate-100 mb-8 tracking-wider">
            Turn your everyday items into a fun game of detection!
          </h2>
          <div className="flex flex-row space-x-4">
            <button
              className="rounded-md bg-teal-950 dark:bg-slate-50 px-6 py-3 text-slate-50 dark:text-teal-950 font-semibold shadow hover:bg-teal-900 transition"
              onClick={handleSignUp}
            >
              Get Started
            </button>
            <button
              className="rounded-md  bg-teal-950 dark:bg-slate-50 px-6 py-3 text-white dark:text-teal-950 font-semibold shadow hover:bg-teal-900 transition"
              onClick={handleLogin}
            >
              Sign In
            </button>
            <button className="rounded-md bg-white px-6 py-3 text-black font-semibold shadow hover:bg-gray-100 transition">
              Learn More
            </button>
          </div>
        </div>

        {/* Right Section for Image */}
        <div className="w-3/5">
          <img
            className="h-screen w-full object-cover"
            style={{ clipPath: "polygon(10% 0, 100% 0, 100% 100%, 0% 100%)" }}
            src="../assets/pic2-c.png"
            alt="objectsPicture"
          />
        </div>
      </div>
    </main>
  );
}
export default Landing;
