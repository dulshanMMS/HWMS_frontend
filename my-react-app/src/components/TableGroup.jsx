export default function TableGroup({ tableNumber }) {
    return (
      <div className="p-1 bg-green-200 rounded-md text-center font-medium text-green-800 text-sm mx-auto">
        Table-{tableNumber}
      </div>
    );
  }