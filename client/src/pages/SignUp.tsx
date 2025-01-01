import { FormEvent, useState } from "react";
import { SignUpData } from "../interfaces/SignUpData.tsx";
import { useAuthStore } from "@/store.ts";
import { useNavigate } from "react-router-dom";
import { ADD_USER } from "../utils/mutations";
import { useMutation } from "@apollo/client";

const SignUp: React.FC = () => {
  const navigate = useNavigate();

  // define the state variables
  const [form, setForm] = useState<SignUpData>({
    username: "",
    password: "",
    email: "",
  });
  const [err, setErr] = useState<string | null>(null);
  const login = useAuthStore((state) => state.login);
  // useMutation hook to sign up a user
  const [addUser, { error }] = useMutation(ADD_USER);

  // function handleInputChange for the form inputs
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target; //get the user input
    setForm({ ...form, [name]: value }); // set the form state
    // console.log(setForm);
  };

  // function to handle the form submission
  const handleFormSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const { data } = await addUser({
        variables: {
          input: {... form}
        },
      });
      login(data.addUser.token); // this will set the isLoggedIn state to true once the token is valid
      navigate("/game"); // once isLogged is is true, it'll navigate to the login page
    } catch (err) {
      console.error(error || err);
      setErr("Error Signing in");
    }

    setForm({
      username: "",
      password: "",
      email: "",
    });
  };

  return (
    <div className=" bg-gray-50 dark:bg-neutral-950 h-screen flex overflow-hidden">
      {/* left section: Login form */}
      <div className="w-2/5 flex flex-col justify-center items-start px-12">
        <div className="absolute top-4 left-4 z-10">
          <h2 className="font-bold tracking-widest px-7 flex flex-row">
            <span className="text-teal-950 dark:text-slate-50 text-2xl">F</span>
            <span className="text-teal-900 dark:text-slate-100 text-1xl self-end">
              WO
            </span>
            <span className="text-teal-950 dark:text-slate-50 text-2xl">B</span>
          </h2>
        </div>

        <h1 className="lg:text-4xl md:text-3xl sm:xl font-bold text-teal-900 dark:text-slate-100 mb-6">
          Let's Get Started!
        </h1>
        <form
          className="flex flex-col box-border w-full max-w-sm"
          onSubmit={handleFormSubmit}
        >
          {/* Username field */}
          <div className="flex flex-col mb-4">
            <label className="text-sm md:text-base text-gray-800 dark:text-slate-50 font-medium mb-2">
              Username:
            </label>
            <input
              type="text"
              name="username"
              value={form.username || ""}
              id="username"
              required
              onChange={handleInputChange}
              className="box-border w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:outline-none"
            />
          </div>
          {/* Username field */}
          <div className="flex flex-col mb-4">
            <label className="text-sm md:text-base text-gray-800 dark:text-slate-50 font-medium mb-2">
              Email Address:
            </label>
            <input
              type="text"
              name="email"
              value={(form.email as string) || ""}
              id="username"
              required
              onChange={handleInputChange}
              className="box-border w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:outline-none"
            />
          </div>
          {/* Password field */}
          <div className="flex flex-col mb-6">
            <label className="text-sm md:text-base text-gray-800 dark:text-slate-50 font-medium mb-2">
              Password:
            </label>
            <input
              type="password"
              name="password"
              value={form.password || ""}
              id="password"
              required
              onChange={handleInputChange}
              className="box-border w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:outline-none"
            />
          </div>
          {err && <p className="text-red-500 text-center">{err}</p>}

          {/* Submit button */}
          <button
            type="submit"
            className="bg-teal-900 dark:bg-slate-100 hover:bg-teal-800 text-white dark:text-teal-950 dark:border dark:border-teal-400 font-semibold transition duration-200 text-sm sm:text-base md:text-lg w-full py-3 rounded-lg shadow-md"
          >
            Sign Up
          </button>
        </form>
        <div className="pt-2 flex flex-row">
          <p className="text-l text-gray-700 dark:text-slate-50 font-small pr-2">
            Already have an account?
          </p>
          <button className="underline text-teal-900 dark:text-teal-400 font-small">
            Log in
          </button>
        </div>
      </div>

      {/* Right section: Mainpic */}
      <div className="w-3/5 hidden md:block relative">
        <img
          className="h-screen w-full object-cover"
          style={{ clipPath: "polygon(10% 0, 100% 0, 100% 100%, 0% 100%)" }}
          src="../../assets/pic2-c.png"
          alt="objectsPicture"
        />
      </div>
    </div>
  );
};

export default SignUp;
