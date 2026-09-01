import { Link } from "react-router-dom";

export function Landing() {
  return (
    <div>
      <h1>Welcome to Jaktra</h1>
      <div>
        <Link to="/login">
          <button type="button">Login</button>
        </Link>
        <Link to="/register">
          <button type="button">Sign Up</button>
        </Link>
      </div>
    </div>
  );
}
