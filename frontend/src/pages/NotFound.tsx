import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <div className="text-xl mx-auto pt-10">
            <p className="text-xl">Page Not Found</p>
            <p className="text-lg">
                Sorry the page you were looking for isn't there. Please <Link to={"/"} className="underline">go home.</Link>
            </p>
        </div>  
    );
}