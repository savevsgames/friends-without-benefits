import Header from "../components/Header.tsx";
import { useState } from "react";

// import queries here once done
import { QUERY_ME } from "@/utils/queries.ts";
import { useAuthStore, useUserSession } from "@/store.ts";
import { useQuery } from "@apollo/client";

function Profile() {
  // set a default profile picture placeholder until changed by the user
  const [picture, setPicture] = useState<string>(
    "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"
  );
  const loggedIn = useAuthStore((state) => state.isLoggedIn);
  const userId = useUserSession((state) => state.user?.id);

  const { loading, data } = useQuery(QUERY_ME, {
    variables: {
      userId: userId,
    },
  });

  if (!loggedIn) {
    return (
      <div>LOG IN FIIIIRST // can be changed to reroute to error page</div>
    );
  }

  if (loading) {
    return <div>LOADING USER PROFILE</div>;
  }

  const user = data?.me || null;

  // TODO: this will have to change to update the user's avatar, and the save the avatar to the backend
  // I think I need a mutation to be able to do a post request to the db
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
      <div className="bg-gray-50 shadow-lg rounded-lg dark:bg-gradient-to-r dark:from-black dark:via-neutral-950 dark:to-teal-950 min-h-screen flex flex-col items-center pt-5 ">
        {/* Profile Header */}
        <h1 className="text-teal-900  dark:text-white font-bold text-3xl mb-6 tracking-widest">
          Player Profile
        </h1>
        <div className="flex flex-col md:flex-row  w-11/12 max-w-4xl bg-teal-50 dark:bg-teal-950 border border-teal-700 dark:border-teal-700 shadow-sm rounded-lg">
          {/* Left Section: Profile Image */}
          <div className="md:w-2/5 flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r">
            <img
              className="rounded-full w-34 h-34 object-cover mb-4 border-4 border-teal-900"
              alt="profile pic"
              src={picture}
            />
            <label
              htmlFor="img-upload"
              className="mt-4 px-4 py-2 bg-teal-50 dark:bg-teal-800 text-teal-900 dark:text-gray-200 font-semibold tracking-wide rounded-lg shadow-lg
         border border-teal-800 dark:border-teal-400 border-l-4 border-l-teal-800 dark:border-l-teal-400  text-sm hover:bg-teal-100 dark:hover:bg-teal-700 transition focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 w-auto"
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
            <ul className="text-gray-700 dark:text-white text-sm space-y-2">
              {[
                { label: "Username:", value: user?.username },
                { label: "Email:", value: user?.email },
                { label: "Started On:", value: user?.createdAt },
                { label: "Player ID:", value: user?.id },
                { label: "Shortest Round:", value: user?.shortestRound },
                { label: "Rounds Played:", value: "Rounds Played" },
              ].map((item, index) => (
                <li key={index} className="grid grid-cols-3 gap-x-2 text-left">
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
