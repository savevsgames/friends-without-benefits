import Countdown from "react-countdown";

export const Dashboard = () => {
  const items = ["Item1", "Item2", "Item3", "Item4", "Item5"];

  return (
    <div className="max-w-screen-lg mx-auto bg-gray-100 shadow-lg rounded-lg p-4 text-teal-950 tracking-widest font-bold max-h-full overflow-auto">
      {/* Header */}
      <h1 className="text-center text-xl sm:text-2xl mb-4">Game Dashboard</h1>

      <div className="space-y-4 sm:space-y-6">
        {/* Timer Section */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg sm:text-xl text-gray-900 pb-2 font-bold">
            Game Timer
          </h2>
          <div className="text-sm sm:text-base md:text-lg text-teal-800 font-semibold">
            <Countdown date={Date.now() + 10000} />
          </div>
        </div>

        {/* Items Found Section */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg sm:text-xl text-gray-900 pb-2 font-bold">
            Items Found
          </h2>
          <div className="text-sm sm:text-base md:text-lg text-teal-800 font-semibold">
            0/5
          </div>
        </div>

        {/* Items To Find Section */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg sm:text-xl text-gray-900 pb-2 font-bold">
            Items To Find
          </h2>
          <ul className="mt-2 space-y-2">
            {items.map((item, i) => (
              <li
                key={i}
                className="bg-teal-100 hover:bg-teal-200 transition rounded-md px-3 py-2 text-xs sm:text-sm md:text-base"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
