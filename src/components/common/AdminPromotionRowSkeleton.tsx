import React from "react";

const AdminPromotionRowSkeleton: React.FC = () => (
  <tr className="animate-pulse">
    <td className="px-2 py-4">
      <div className="h-4 w-24 rounded bg-gray-200" />
    </td>
    <td className="px-2 py-4">
      <div className="h-4 w-32 rounded bg-gray-100" />
    </td>
    <td className="px-2 py-4">
      <div className="h-4 w-20 rounded bg-gray-100" />
    </td>
    <td className="px-2 py-4">
      <div className="h-4 w-16 rounded bg-gray-100" />
    </td>
    <td className="px-2 py-4">
      <div className="h-8 w-20 rounded-full bg-gray-200" />
    </td>
  </tr>
);

export default AdminPromotionRowSkeleton;
