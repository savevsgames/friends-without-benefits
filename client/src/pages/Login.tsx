import { FormEvent, useState } from "react";
import { UserLogin } from "../interfaces/userLogin.tsx";
import { useAuthStore, useUserSession } from "@/store.ts";
import { useNavigate } from "react-router-dom";
import { LOGIN_USER } from "../utils/mutations";
import { useMutation } from "@apollo/client";

const Login: React.FC = () => {
  const navigate = useNavigate();

  // define the state variables
  const [form, setForm] = useState<UserLogin>({ username: "", password: "" });
  const [err, setErr] = useState<string | null>(null);
  const login = useAuthStore((state) => state.login);
  useUserSession.getState().UserDataFromToken();

  // function handleInputChange for the form inputs
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target; //get the user input
    setForm({ ...form, [name]: value }); // set the form state
    console.log(setForm);
  };

  // useMutation hook to login a user
  const [userLogin, { error }] = useMutation(LOGIN_USER);

  // function to handle the form submission
  const handleFormSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const { data } = await userLogin({
        variables: {
          ...form,
        },
      });
      login(data.userLogin.token); // if the token is valid it'll set isLoggedIn to true
      navigate("/game"); // once isLogged is is true, it'll navigate to the game page
    } catch (err) {
      console.error(error || err);
      setErr("Error Logging in");
    }

    setForm({
      username: "",
      password: "",
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
        <h1 className="lg:text-4xl md:text-3xl sm:xl font-bold text-teal-900 dark:text-slate-50 mb-6">
          Welcome Back!
        </h1>
        <form
          className="flex flex-col box-border w-full max-w-sm"
          onSubmit={handleFormSubmit}
        >
          {/* Username field */}
          <div className="flex flex-col mb-4">
            <label className="text-sm md:text-base text-gray-800 dark:text-slate-100 font-medium mb-2">
              Username:
            </label>
            <input
              type="text"
              name="username"
              value={form.username}
              id="username"
              required
              onChange={handleInputChange}
              className="box-border w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400 focus:outline-none"
            />
          </div>
          {/* Password field */}
          <div className="flex flex-col mb-6">
            <label className="text-sm md:text-base text-gray-700 dark:text-slate-100 font-medium mb-2">
              Password:
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
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
            className="bg-teal-900 dark:bg-slate-100 hover:bg-teal-800 text-white dark:text-teal-950 font-semibold transition duration-200 text-sm sm:text-base md:text-lg w-full py-3 rounded-lg shadow-md dark:border-2 dark:border-teal-400"
          >
            Sign in
          </button>
        </form>
        <div className="pt-2 flex flex-row">
          <p className="text-l text-gray-700 dark:text-slate-50 font-small pr-2">
            Don't have an account?
          </p>
          <button className="underline text-teal-900 dark:text-teal-400 font-small">
            Sign Up
          </button>
        </div>
      </div>
      {/* Right section: Mainpic */}
      <div className="w-3/5 hidden md:block relative">
        <img
          className="h-screen w-full object-cover"
          style={{ clipPath: "polygon(10% 0, 100% 0, 100% 100%, 0% 100%)" }}
          src="/assets/pic2-c.png"
          alt="objectsPicture"
        />
      </div>
    </div>
  );
};

export default Login;
