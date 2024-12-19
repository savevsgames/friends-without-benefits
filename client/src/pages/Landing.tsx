import { useNavigate } from "react-router-dom";

function Landing() {
  const navigate = useNavigate();

  const handleSignUp = () => {
    navigate("/signup");
  };

  const handleLogin = () => {
    navigate("/game");
  };

  return (
    <div className="bg-white h-screen flex overflow-hidden">
      {/* Left Section for Text Content */}
      <div className="w-1/2 flex flex-col justify-center items-start px-12">
        <div className="absolute top-4 left-4 z-10">
          <h2 className="font-bold tracking-widest px-7 flex flex-row">
            <span className="text-teal-950 text-2xl">F</span>
            <span className="text-teal-900 text-1xl self-end">WO</span>
            <span className="text-teal-950 text-2xl">B</span>
          </h2>
        </div>
        <h3 className="text-lg text-teal-900 mb-4 tracking-wider">
          Think fast. Spot faster. Win big.
        </h3>
        <h1 className="text-5xl font-extrabold text-teal-950 mb-6 tracking-wide leading-snug">
          FIND OBJECTS USING YOUR CAMERA
        </h1>
        <h2 className="text-lg text-teal-900 mb-8 tracking-wider">
          Turn your everyday items into a fun game of detection!
        </h2>
        <div className="flex flex-row space-x-4">
          <button
            className="rounded-md bg-teal-950 px-6 py-3 text-white font-semibold shadow hover:bg-teal-900 transition"
            onClick={handleSignUp}
          >
            Get Started
          </button>
          <button
            className="rounded-md bg-teal-950 px-6 py-3 text-white font-semibold shadow hover:bg-teal-900 transition"
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
      <div className="w-1/2">
        <img
          className="h-screen w-full object-cover"
          src="https://i.pinimg.com/736x/b2/22/2d/b2222d5d8422bf18c2c8fb524ca63c31.jpg"
          alt="objectsPicture"
        />
      </div>
    </div>
  );
}
export default Landing;
