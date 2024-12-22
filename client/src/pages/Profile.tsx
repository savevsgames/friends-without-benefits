import Header from "../components/Header.tsx";
import { useEffect, useState } from "react";

function Profile() {
  const [file, setFile] = useState<string>();

  const handleChange = (event: React.ChangeEvent) => {
    const target = event.target as HTMLInputElement;
    const newFile: File = (target.files as FileList)[0];
    const stringFile: string = URL.createObjectURL(newFile); // convert from File to String
    if (stringFile) {
      setFile(stringFile)
    }
      setFile("https://avatar.iran.liara.run/public/50")
   
  };
  // this just for now until we tie to an actual user data
  useEffect(() => {

    const placeholder =
      "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541";
    setFile(placeholder)
  }, [])

  return (
    <>
      <Header />
      <div className="bg-gray-50 min-h-screen flex flex-col items-center pt-5 ">
        {/* Profile Header */}
        <h1 className="text-teal-900 font-bold text-3xl mb-6 tracking-widest">
          Player Profile
        </h1>
        <div className="flex flex-col md:flex-row bg-white shadow-lg rounded-lg w-11/12 max-w-4xl border border-teal-100 border-4">
          {/* Left Section: Profile Image */}
          <div className="md:w-2/5 flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r">
            <img
              className="rounded-full w-34 h-34 object-cover mb-4 border-4 border-teal-900"
              alt="profile pic"
              src={file}
            />
            <label
              htmlFor="img-upload"
              className="mt-4 px-4 py-2 bg-teal-900 text-white text-sm font-semibold rounded-lg hover:bg-teal-800 w-auto"
            >
              Upload a Profile picture
            </label>
            <input
              id='img-upload'
              type="file"
              onChange={handleChange}
              className="hidden"
            />
          </div>

          {/* Right Section: Player Details */}
          <div className="md:w-3/5 flex flex-col justify-center p-6 ">
            <ul className="text-gray-700 text-sm space-y-2">
              <li>
                <span className="font-medium tracking-widest">Player Username:</span>{" "}
                Player Username
              </li>
              <li>
                <span className="font-medium tracking-widest">Player Email:</span>{" "}
                Player Email
              </li>
              <li>
                <span className="font-medium tracking-widest">Started On:</span>{" "}
                Started On
              </li>
              <li>
                <span className="font-medium tracking-widest">Player ID:</span>{" "}
                Player ID
              </li>
              <li>
                <span className="font-medium tracking-widest">
                  Shortest Round:
                </span>{" "}
                Shortest Round
              </li>
              <li>
                <span className="font-medium tracking-widest">
                  Rounds Played:
                </span>{" "}
                Rounds Played
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;
