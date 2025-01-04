import HomeHeader from "../components/HomeHeader.tsx";
import Typewriter from "typewriter-effect";
import Footer from "@/components/Footer.tsx";
import { useNavigate } from "react-router-dom";

function Home() {
  // const [isModalOpen, setIsModalOpen] = useState(false);

  // const openModal = () => setIsModalOpen(true);
  // const closeModal = () => setIsModalOpen(false);
  const navigate = useNavigate();
  return (
    <>
      <HomeHeader />

      <div className="my-3 flex flex-row items-stretch justify-center gap-10 mt-10">
        <div className="max-w-xs rounded-lg overflow-hidden shadow-lg flex flex-col">
          <img
            className="w-full h-48 object-cover"
            src="/assets/scanvengerhunt.jpg"
            alt="scanvenger hunt"
          />
          <div className="px-6 py-4 flex-1 flex flex-col justify-between">
            <div>
              <div className="font-bold text-xl mb-2 text-center text-teal-950">
                SCAVENGER HUNT
              </div>
              <p className="text-gray-700 text-base">
                Turn your world into a playground! Find objects using your own
                camera, conquer challenges and unlock surprises.
              </p>
            </div>
            <div className="pt-4 text-center">
              <button
                className="border-2 p-1 text-center border-neutral-500 rounded-sm"
                onClick={() => navigate("/game")}
              >
                Start Hunting
              </button>
            </div>
          </div>
        </div>

        {/* another game selection */}
        <div className="max-w-xs rounded-lg overflow-hidden shadow-lg flex flex-col">
          <img
            className="w-full h-48 object-cover"
            src="/assets/artarena.jpg"
            alt="scanvenger hunt"
          />
          <div className="px-6 py-4 flex-1 flex flex-col justify-between">
            <div>
              <div className="font-bold text-xl mb-2 text-center text-teal-950">
                ART ARENA
              </div>
              <p className="text-xs font-normal text-center">
                <Typewriter
                  options={{
                    delay: 100,
                    loop: true,
                  }}
                  onInit={(typewriter) => {
                    typewriter
                      .typeString("Coming soon..")
                      .start()
                      .pauseFor(50)
                      .deleteAll();
                  }}
                />
              </p>
            </div>
            <p className="text-gray-700 text-base">
              A head-to-head drawing game where players compete to create the
              best or most accurate sketch, packed with fun and excitement!
            </p>

            <div className="pt-4 text-center">
              <button className="border-2 p-1 text-center border-neutral-500 rounded-sm">
                Start Drawing
              </button>
            </div>
          </div>
        </div>

        {/* another game selection */}
        <div className="max-w-xs rounded-lg overflow-hidden shadow-lg flex flex-col">
          <img
            className="w-full h-48 object-cover"
            src="/assets/poseforcamera.jpg"
            alt="scanvenger hunt"
          />
          <div className="px-6 py-4 flex-1 flex flex-col justify-between">
            <div>
              <div className="font-bold text-xl mb-2 text-center text-teal-950">
                POSE FOR THE CAMERA
              </div>
              <p className="text-xs font-normal text-center">
                <Typewriter
                  options={{
                    delay: 100,
                    loop: true,
                  }}
                  onInit={(typewriter) => {
                    typewriter
                      .typeString("Coming soon..")
                      .start()
                      .pauseFor(50)
                      .deleteAll();
                  }}
                />
              </p>
            </div>
            <p className="text-gray-700 text-base ">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sunt
              dicta sint tempore, cupiditate expedita, repudiandae cum dolor et
            </p>

            <div className="pt-4 text-center">
              <button className="border-2 p-1 text-center border-neutral-500 rounded-sm">
                Start Posing
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* <GameOptionsModal isOpen={isModalOpen} onClose={closeModal} /> */}

      <Footer />
    </>
  );
}

export default Home;
