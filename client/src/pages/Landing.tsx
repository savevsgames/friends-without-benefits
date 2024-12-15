

function Landing() {
  return (
    <div className="bg-white h-screen flex overflow-hidden">
      {/* Left Section for Text Content */}
      <div className="w-1/2 flex flex-col justify-center items-start px-12">
        <h3 className="text-lg text-gray-600 mb-4 tracking-wider">
          Think fast. Spot faster. Win big.
        </h3>
        <h1 className="text-6xl font-extrabold text-gray-900 mb-6 tracking-wide leading-snug">
          FIND OBJECTS USING YOUR CAMERA
        </h1>
        <h2 className="text-lg text-gray-600 mb-8 tracking-wider">
          Turn your everyday items into a fun game of detection!
        </h2>
        <div className="flex flex-row space-x-4">
          <button className="rounded-md bg-blue-500 px-6 py-3 text-white font-semibold shadow hover:bg-blue-600 transition">
            Get Started
          </button>

          <button className="rounded-md bg-blue-500 px-6 py-3 text-white font-semibold shadow hover:bg-blue-600 transition">
            Sign In
          </button>
          <button className="rounded-md bg-transparent-500 px-6 py-3 text-black font-semibold shadow hover:bg-blue-600 transition">
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
export default Landing