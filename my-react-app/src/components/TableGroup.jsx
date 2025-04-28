export default function TableGroup({ tableNumber }) {
    return (
      <div className="w-[248px] h-8 bg-green-200 rounded-lg flex items-center justify-center text-xs font-semibold text-green-800 shadow-md">
        Table {tableNumber}
      </div>
    );
  }