import Header from "../components/Header.tsx";
import {  useState } from "react";
import { getUserIdFromToken } from "@/utils/userToken.ts";
import UserData from "@/interfaces/UserData.ts";

// import queries here once done
import { QUERY_ME } from "@/utils/queries.ts";

function Profile() {

  // set a default profile picture placeholder until changed by the user
  const [picture, setPicture] = useState<string>(
    "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"
  );

  

  const handleChange = (event: React.ChangeEvent) => {
    const target = event.target as HTMLInputElement;
    const newFile: File | undefined = (target.files as FileList)[0]; // get the selected file
    if (newFile) {
      const stringFile: string = URL.createObjectURL(newFile); // convert from File to String
      console.log(stringFile);
      setPicture(stringFile);
    }
      console.log("failed uploading profile image");
  };






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
              src={picture}
            />
            <label
              htmlFor="img-upload"
              className="mt-4 px-4 py-2 bg-teal-900 text-white text-sm font-semibold rounded-lg hover:bg-teal-800 w-auto"
            >
              Upload a Profile picture
            </label>
            <input
              id="img-upload"
              type="file"
              onChange={handleChange}
              className="hidden"
            />
          </div>

          {/* Right Section: Player Details */}
          <div className="md:w-3/5 flex flex-col justify-center p-6">
            <ul className="text-gray-700 text-sm space-y-2">
              {[
                { label: "Username:", value: "Player Username" },
                { label: "Email:", value: "Player Email" },
                { label: "Started On:", value: "Started On" },
                { label: "Player ID:", value: "Player ID" },
                { label: "Shortest Round:", value: "Shortest Round" },
                { label: "Rounds Played:", value: "Rounds Played" },
              ].map((item, index) => (
                <li
                  key={index}
                  className="grid grid-cols-3 gap-x-2 text-left"
                >
                  <span className="font-medium tracking-widest">
                    {item.label}
                  </span>
                  <span>{item.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;
