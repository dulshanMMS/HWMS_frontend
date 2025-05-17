import React from 'react';

const DeskUsageTable = ({ data }) => {
  const transformDeskUsage = () => {
    if (!data?.deskUsage) return [];
    return data.deskUsage.map(item => ({
      floor: item.floor,
      used: item.used,
      unused: item.unused
    }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm mb-6 overflow-hidden">
      <h2 className="text-xl font-semibold text-gray-800 p-6 border-b">Desk Usage</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Floor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Used</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unused</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transformDeskUsage().map((row, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.floor}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.used}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.unused}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeskUsageTable; 