import { Link } from "react-router-dom";

export function Logo() {
  return (
    <Link to="/events">
      <h1 className="font-bold text-xl">Agora</h1>
    </Link>
  );
}
