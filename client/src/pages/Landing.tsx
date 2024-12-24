import { useNavigate } from "react-router-dom";
import { useThemeStore } from "@/store";


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


  return (
    <main data-mode={theme}>
      <div className="bg-slate-50 dark:bg-gray-900 h-screen flex overflow-hidden">
        {/* Left Section for Text Content */}
        <div className="w-2/5 flex flex-col justify-center items-start px-12">
          <div className="absolute top-4 left-4 z-10">
            <h2 className="font-bold tracking-widest px-7 flex flex-row">
              <span className="text-teal-950 dark:text-slate-50 text-2xl">
                F
              </span>
              <span className="text-teal-900 dark:text-slate-100 text-1xl self-end">
                WO
              </span>
              <span className="text-teal-950 dark:text-slate-100 text-2xl">
                B
              </span>

              <button
                onClick={toggleTheme}
                type="button"
                className="p-4 rounded bg-black dark:bg-white text-white dark:text-black font-semibold"
              >
                Toggle Theme
              </button>
            </h2>
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
