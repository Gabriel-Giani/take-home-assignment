export default function Home() {
  return (
    <main className="h-screen grid grid-cols-2 gap-2 p-4">
      <div className="border border-gray-300 rounded-md p-2 overflow-auto">
        {/* PDF viewer will go here */}
        <p className="text-center text-gray-500">PDF Viewer</p>
      </div>

      <div className="border border-gray-300 rounded-md p-2 overflow-auto">
        {/* Extracted text will go here */}
        <p className="text-center text-gray-500">Extracted Text</p>
      </div>
    </main>
  );
}
