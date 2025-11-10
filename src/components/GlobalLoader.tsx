export function GlobalLoader() {
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-950 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400 mb-4" />
        <p className="text-gray-700 dark:text-gray-300">Loading...</p>
      </div>
    </div>
  );
}
