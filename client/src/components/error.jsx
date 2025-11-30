const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-10 gap-6">
      <h1 className="text-8xl font-extrabold text-gray-800 tracking-tight">
        404
      </h1>

      <p className="text-3xl text-gray-600 mt-4">Page not found</p>

      <p className="text-gray-500 mt-6 text-xl max-w-4xl text-center break-words">
        We could not locate the page you were trying to open. It might have been
        removed or renamed.
      </p>

      <a
        href="/"
        className="block !px-10 !py-4 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
      >
        Go back to Home
      </a>
    </div>
  );
};

export default NotFound;
