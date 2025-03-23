
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8 bg-white/50 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 max-w-md">
        <h1 className="text-6xl font-bold mb-4 text-title">404</h1>
        <p className="text-xl text-subtitle mb-6">הדף שחיפשת לא נמצא</p>
        <a href="/" className="inline-block bg-accent1 hover:bg-accent1/90 text-white py-2 px-6 rounded-lg transition-colors">
          חזרה לדף הבית
        </a>
      </div>
    </div>
  );
};

export default NotFound;
