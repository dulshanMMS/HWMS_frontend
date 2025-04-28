import FloorLayout from './components/FloorLayout';

export default function App() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 px-4 sm:px-0">
      <div className="w-full sm:w-1/2">
        <FloorLayout />
      </div>
    </div>
  );
}