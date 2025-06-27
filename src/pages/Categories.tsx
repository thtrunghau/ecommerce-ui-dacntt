// /* eslint-disable @typescript-eslint/no-explicit-any */
// import React, { useEffect, useState } from "react";
// import useAuthStore from "../store/authStore";
// import { categoryApi } from "../services/apiService";
// import type { UUID } from "../types/api";
// import { toast } from "react-toastify";

// const CategoryForm: React.FC<{
//   initial?: { id?: UUID; categoryName: string };
//   onSubmit: (data: { id?: UUID; categoryName: string }) => void;
//   onCancel: () => void;
//   loading?: boolean;
// }> = ({ initial, onSubmit, onCancel, loading }) => {
//   const [categoryName, setCategoryName] = useState(initial?.categoryName || "");

//   useEffect(() => {
//     setCategoryName(initial?.categoryName || "");
//   }, [initial]);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!categoryName.trim()) {
//       toast.error("Tên danh mục không được để trống");
//       return;
//     }
//     onSubmit({ id: initial?.id, categoryName: categoryName.trim() });
//   };

//   return (
//     <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//       <input
//         className="rounded border px-3 py-2"
//         value={categoryName}
//         onChange={(e) => setCategoryName(e.target.value)}
//         placeholder="Tên danh mục"
//         disabled={loading}
//         required
//       />
//       <div className="flex justify-end gap-2">
//         <button
//           type="submit"
//           className="rounded bg-black px-4 py-2 font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
//           disabled={loading}
//         >
//           {initial ? "Lưu" : "Thêm"}
//         </button>
//         <button
//           type="button"
//           className="rounded border border-gray-400 px-4 py-2 font-semibold text-black hover:bg-gray-100 disabled:opacity-60"
//           onClick={onCancel}
//           disabled={loading}
//         >
//           Hủy
//         </button>
//       </div>
//     </form>
//   );
// };

// const AdminCategories: React.FC = () => {
//   const { authorities } = useAuthStore();
//   const isAdminOrSeller =
//     authorities.includes("admin") || authorities.includes("seller");

//   const [categories, setCategories] = useState<
//     Array<{ id: UUID; categoryName: string }>
//   >([]);
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [showForm, setShowForm] = useState(false);
//   const [editCategory, setEditCategory] = useState<{
//     id?: UUID;
//     categoryName: string;
//   } | null>(null);
//   const [showDelete, setShowDelete] = useState<{
//     id: UUID;
//     name: string;
//   } | null>(null);

//   const fetchCategories = async () => {
//     setLoading(true);
//     try {
//       const res = await categoryApi.getList({ page: 0, size: 100 });
//       setCategories(res.data);
//     } catch {
//       toast.error("Không thể tải danh mục");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (isAdminOrSeller) fetchCategories();
//   }, [isAdminOrSeller]);

//   const handleAdd = async (data: { categoryName: string }) => {
//     setLoading(true);
//     try {
//       await categoryApi.create(data);
//       toast.success("Thêm danh mục thành công");
//       setShowForm(false);
//       fetchCategories();
//     } catch (err: any) {
//       if (err.message?.includes("Conflict"))
//         toast.error("Tên danh mục đã tồn tại");
//       else toast.error("Lỗi thêm danh mục");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEdit = (cat: { id: UUID; categoryName: string }) => {
//     setEditCategory(cat);
//     setShowForm(true);
//   };

//   const handleUpdate = async (data: { id?: UUID; categoryName: string }) => {
//     if (!data.id) return;
//     setLoading(true);
//     try {
//       await categoryApi.update(data.id, { categoryName: data.categoryName });
//       toast.success("Cập nhật danh mục thành công");
//       setEditCategory(null);
//       setShowForm(false);
//       fetchCategories();
//     } catch (err: any) {
//       if (err.message?.includes("Conflict"))
//         toast.error("Tên danh mục đã tồn tại");
//       else toast.error("Lỗi cập nhật danh mục");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (id: UUID) => {
//     setLoading(true);
//     try {
//       await categoryApi.delete(id);
//       toast.success("Xóa danh mục thành công");
//       setShowDelete(null);
//       fetchCategories();
//     } catch {
//       toast.error("Lỗi xóa danh mục");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isAdminOrSeller) {
//     return (
//       <div className="mx-auto mt-16 max-w-2xl text-center text-lg font-semibold text-red-600">
//         Bạn không có quyền truy cập trang này.
//       </div>
//     );
//   }

//   const filtered = categories.filter((c) =>
//     c.categoryName.toLowerCase().includes(search.toLowerCase()),
//   );

//   return (
//     <div className="mx-auto max-w-3xl px-2 py-8">
//       <h1 className="mb-8 text-center text-3xl font-bold tracking-tight text-gray-900">
//         Quản lý danh mục
//       </h1>
//       <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//         <input
//           className="w-full rounded-full border border-gray-300 bg-white px-5 py-2 text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-black focus:ring-2 focus:ring-black/20 sm:w-80"
//           placeholder="Tìm kiếm danh mục..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//         />
//         <button
//           onClick={() => {
//             setShowForm(true);
//             setEditCategory(null);
//           }}
//           className="rounded-full bg-black px-6 py-2 font-semibold text-white shadow transition hover:border hover:border-black hover:bg-white hover:text-black"
//         >
//           Thêm danh mục
//         </button>
//       </div>
//       <div className="rounded-2xl bg-white p-6 shadow-lg">
//         <table className="w-full text-left">
//           <thead>
//             <tr className="text-base text-gray-500">
//               <th className="py-2">Tên danh mục</th>
//               <th className="w-40 py-2">Hành động</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filtered.map((cat) => (
//               <tr
//                 key={cat.id}
//                 className="border-t text-base transition hover:bg-gray-50"
//               >
//                 <td className="py-2">{cat.categoryName}</td>
//                 <td className="py-2">
//                   <div className="flex gap-2">
//                     <button
//                       onClick={() => handleEdit(cat)}
//                       className="rounded border border-black bg-white px-4 py-1 font-semibold text-black hover:bg-black hover:text-white"
//                     >
//                       Sửa
//                     </button>
//                     <button
//                       onClick={() =>
//                         setShowDelete({ id: cat.id, name: cat.categoryName })
//                       }
//                       className="rounded border border-red-500 bg-white px-4 py-1 font-semibold text-red-600 hover:bg-red-500 hover:text-white"
//                     >
//                       Xóa
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//             {filtered.length === 0 && (
//               <tr>
//                 <td colSpan={2} className="py-4 text-center text-gray-400">
//                   Không có danh mục nào.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//       {/* Modal Form Thêm/Sửa */}
//       {showForm && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
//           <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
//             <h2 className="mb-4 text-lg font-semibold">
//               {editCategory ? "Sửa danh mục" : "Thêm danh mục"}
//             </h2>
//             <CategoryForm
//               initial={editCategory || undefined}
//               onSubmit={editCategory ? handleUpdate : handleAdd}
//               onCancel={() => {
//                 setShowForm(false);
//                 setEditCategory(null);
//               }}
//               loading={loading}
//             />
//           </div>
//         </div>
//       )}
//       {/* Modal Xác nhận xóa */}
//       {showDelete && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
//           <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
//             <button
//               type="button"
//               onClick={() => setShowDelete(null)}
//               className="absolute right-4 top-4 text-2xl font-bold text-gray-400 hover:text-black"
//             >
//               ×
//             </button>
//             <h2 className="mb-4 text-lg font-semibold text-red-600">
//               Xác nhận xóa
//             </h2>
//             <p className="mb-6">
//               Bạn có chắc chắn muốn xóa danh mục <b>{showDelete.name}</b> không?
//             </p>
//             <div className="flex justify-end gap-2">
//               <button
//                 onClick={() => setShowDelete(null)}
//                 className="rounded border border-gray-400 px-4 py-2 font-semibold text-black hover:bg-gray-100"
//                 disabled={loading}
//               >
//                 Hủy
//               </button>
//               <button
//                 onClick={() => handleDelete(showDelete.id)}
//                 className="rounded border border-red-500 bg-white px-4 py-2 font-semibold text-red-600 hover:bg-red-500 hover:text-white"
//                 disabled={loading}
//               >
//                 Xóa
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminCategories;
