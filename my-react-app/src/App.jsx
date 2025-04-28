import FloorLayout from './components/FloorLayout';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <div className="App">
        <FloorLayout />
      </div>
    </ErrorBoundary>
  );
}

export default App;