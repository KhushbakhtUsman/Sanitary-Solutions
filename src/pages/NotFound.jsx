import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";

export const NotFound = () => (
  <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4">
    <div className="max-w-md text-center">
      <p className="text-5xl font-semibold text-gray-900">404</p>
      <p className="mt-3 text-gray-600">The page you are looking for does not exist.</p>
      <Link to="/">
        <Button className="mt-6">Back to home</Button>
      </Link>
    </div>
  </div>
);
