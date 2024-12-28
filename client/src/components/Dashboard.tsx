import Countdown from "react-countdown";

export const Dashboard = () => {
  const items = ["Item1", "Item2", "Item3", "Item4", "Item5"];

  return (
    <div className="max-w-screen-md mx-auto bg-teal-50 dark:bg-teal-950 shadow-lg rounded-lg p-4 text-teal-900 dark:text-gray-200 font-medium max-h-full overflow-auto">
      {/* Header */}
      <h1 className="text-center text-base sm:text-lg md:text-xl mb-4 tracking-wide font-bold text-teal-900 dark:text-white">
        Game Dashboard
      </h1>

      <div className="space-y-4">
        {/* Timer and Items Found Section - Flex layout */}
        <div className="flex gap-4">
          {/* Timer Section */}
          <div className="flex-1 bg-teal-100 dark:bg-teal-900 rounded-md shadow p-4 border-l-4 border-l-teal-800 dark:border-l-teal-400 border border-teal-900 dark:border-gray-600 transition hover:shadow-lg">
            <h2 className="text-sm sm:text-base md:text-lg text-teal-800 dark:text-teal-100 font-semibold pb-2">
              Game Timer
            </h2>
            <div className="text-xs sm:text-sm md:text-base text-teal-900 dark:text-gray-300 font-medium">
              <Countdown date={Date.now() + 10000} />
            </div>
          </div>

          {/* Items Found Section */}
          <div className="flex-1 bg-teal-100 dark:bg-teal-900 rounded-md shadow p-4 border-l-4 border-l-teal-800 dark:border-l-teal-400 border border-teal-900 dark:border-gray-600 transition hover:shadow-lg">
            <h2 className="text-sm sm:text-base md:text-lg text-teal-800 dark:text-teal-100 font-semibold pb-2">
              Items Found
            </h2>
            <div className="text-xs sm:text-sm md:text-base text-teal-900 dark:text-gray-300 font-medium">
              0/5
            </div>
          </div>
        </div>

        {/* Items To Find Section */}
        <div className="bg-teal-100 dark:bg-teal-900 rounded-md shadow p-4 border-l-4 border-l-teal-800 dark:border-l-teal-400 border border-teal-900 dark:border-gray-600 transition hover:shadow-lg">
          <h2 className="text-sm sm:text-base md:text-lg text-teal-800 dark:text-teal-100 font-semibold pb-2">
            Items To Find
          </h2>
          <ul className="mt-3 space-y-2">
            {items.map((item, i) => (
              <li
                key={i}
                className="border-l-4 border-l-teal-800 dark:border-l-teal-400 border border-teal-900 dark:border-gray-600 rounded px-3 py-2 text-xs sm:text-sm md:text-base text-teal-900 dark:text-teal-100 font-medium transition hover:bg-teal-100 hover:text-teal-800 dark:hover:bg-teal-800 dark:hover:text-teal-100"
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
