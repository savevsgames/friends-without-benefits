const Login = () => {
  return (
    <div className=" bg-gray-50 h-screen flex overflow-hidden">
      {/* left section: Login form */}
      <div className="w-2/5 flex flex-col justify-center items-start px-12">
        <div className="absolute top-4 left-4 z-10">
          <h2 className="font-bold tracking-widest px-7 flex flex-row">
            <span className="text-teal-950 text-2xl">F</span>
            <span className="text-teal-900 text-1xl self-end">WO</span>
            <span className="text-teal-950 text-2xl">B</span>
          </h2>
        </div>
        <h1 className="text-2xl md:text-4xl font-bold text-teal-900 mb-6">
          Welcome Back!
        </h1>
        <form className="flex flex-col box-border w-full max-w-sm">
          {/* Username field */}
          <div className="flex flex-col mb-4">
            <label className="text-sm md:text-base text-gray-800 font-medium mb-2">
              Username:
            </label>
            <input
              type="text"
              name="username"
              id="username"
              required
              className="box-border w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:outline-none"
            />
          </div>
          {/* Password field */}
          <div className="flex flex-col mb-6">
            <label className="text-sm md:text-base text-gray-700 font-medium mb-2">
              Password:
            </label>
            <input
              type="password"
              name="password"
              id="password"
              required
              className="box-border w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:outline-none"
            />
          </div>
          {/* Submit button */}
          <button
            type="submit"
            className="bg-teal-900 hover:bg-teal-800 text-white font-semibold transition duration-200 text-sm sm:text-base md:text-lg w-full py-3 rounded-lg shadow-md"
          >
            Sign in
          </button>
        </form>
      </div>
      {/* Right section: Image */}
      <div className="w-3/5 hidden md:block relative">
        <img
          className="h-screen w-full object-cover"
          style={{ clipPath: "polygon(10% 0, 100% 0, 100% 100%, 0% 100%)" }}
          src="../../assets/mainPic.png"
          alt="objectsPicture"
        />
      </div>
    </div>
  );
};

export default Login;
