import { useDispatch } from "react-redux";
import { setElementStatus } from "@store";
import { fetchData } from "@functions";

export const Login: React.FC = () => {
  const dispatch = useDispatch();
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { username, password } = e.currentTarget;
    const { login, token } = await fetchData.post(`${import.meta.env.VITE_SERVER_URL}/login`, { username: username.value, password: password.value });
    localStorage.setItem("token", token);
    dispatch(setElementStatus({ login }));
  };
  return (
    <div className="fp-login d-grid place-content-center">
      <form className="d-flex flex-wrap g-3" onSubmit={submit}>
        <input className="d-block mx-auto p-1 w-75" type="text" name="username" placeholder="username" />
        <input className="d-block mx-auto p-1 w-75" type="password" name="password" placeholder="password" />
        <button className="fp-btn d-block mx-auto p-1 w-50">Login</button>
      </form>
    </div>
  );
};
