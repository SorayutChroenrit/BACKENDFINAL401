export default function ForbiddenPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-6xl font-bold">403</h1>
      <p className="text-xl my-4">
        You are not authorized to access this page.
      </p>
      <a
        href="/"
        className="text-blue-500 underline hover:text-blue-700 transition-colors"
      >
        Go back to Home
      </a>
    </div>
  );
}
