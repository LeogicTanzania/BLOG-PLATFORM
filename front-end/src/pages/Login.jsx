import { useForm } from "react-hook-form"; // Form hook for managing form state & validation
import { useAuth } from "../context/AuthContext"; // For accessing authentication Logic

// Login component
export default function Login() {
  const { register, handleSubmit } = useForm();

  const { login } = useAuth();

  const onSubmit = async ({ email, password }) => {
    try {
      await login(email, password);
    } catch (error) {
      console.error("Login Failed:", error);
    }
  };

  return (
    <>
      <h1>LOGIN PAGE</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          // This creates input field named 'email' makes it required & lets react-hook-form manage its value, validation & events automatically
          {...register("email", { required: true })}
          type="email"
          placeholder="Email"
        />

        <input
          // This creates input field named 'password' makes it required & lets react-hook-form manage its value, validation & events automatically
          {...register("password", { required: true })}
          type="password"
          placeholder="Password"
        />

        <button type="submit">Login</button>
      </form>
    </>
  );
}
