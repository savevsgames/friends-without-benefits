function Error() {
  return (
    <main>
      <div className="bg-slate-50 dark:bg-neutral-950 h-screen flex overflow-hidden">
        {/* Left Section for Text Content */}
        <div className="w-2/5 flex flex-col justify-center items-start px-12">
          <div className="absolute top-4 left-4 z-10">
            <button className="font-bold tracking-widest px-7 flex flex-row items-center">
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
          <h1 className="font-extrabold text-3xl text-teal-950 leading-loose">
            404: The Scavenger Hunt continues... But this page isn’t part of it!
          </h1>
        </div>

        {/* Right Section for Image */}
        <div className="w-3/5">
          <img
            className="h-screen w-full object-cover"
            style={{ clipPath: "polygon(10% 0, 100% 0, 100% 100%, 0% 100%)" }}
            alt="error page"
            src="/assets/error.jpg"
          />
        </div>
      </div>
    </main>
  );
}
export default Error;
