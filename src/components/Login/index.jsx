import { useDispatch } from "react-redux";
import { setElementStatus } from "@store";
import { fetchData } from "@functions";

export const Login = () => {
  const dispatch = useDispatch();
  const submit = async (e) => {
    e.preventDefault();
    const { username, password } = e.target;
    const { login, token } = await fetchData.post(`${import.meta.env.VITE_SERVER_URL}/login`, { username: username.value, password: password.value });
    localStorage.setItem("token", token);
    dispatch(setElementStatus({ login }));
  };
  return (
    <div className="fp-login">
      <form onSubmit={submit}>
        <input type="text" name="username" placeholder="username" />
        <input type="password" name="password" placeholder="password" />
        <input type="submit" />
      </form>
    </div>
  );
};
