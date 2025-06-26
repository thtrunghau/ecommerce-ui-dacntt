/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { categoryApi } from "../services/apiService";
import type { UUID } from "../types/api";
import { toast } from "react-toastify";
import ProtectedRoute from "../routes/ProtectedRoute";

interface CategoryFormProps {
  initial?: { id?: UUID; categoryName: string };
  onSubmit: (data: { id?: UUID; categoryName: string }) => void;
  onCancel: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  initial,
  onSubmit,
  onCancel,
}) => {
  const [categoryName, setCategoryName] = useState(initial?.categoryName || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      toast.error("Tên category không được để trống");
      return;
    }
    setLoading(true);
    try {
      await onSubmit({ id: initial?.id, categoryName: categoryName.trim() });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", gap: 8, alignItems: "center" }}
    >
      <input
        value={categoryName}
        onChange={(e) => setCategoryName(e.target.value)}
        placeholder="Tên category"
        disabled={loading}
        style={{
          flex: 1,
          padding: 8,
          borderRadius: 4,
          border: "1px solid #ccc",
        }}
      />
      <button type="submit" disabled={loading} style={{ padding: "8px 16px" }}>
        {initial ? "Lưu" : "Thêm"}
      </button>
      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        style={{ padding: "8px 16px" }}
      >
        Hủy
      </button>
    </form>
  );
};

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<
    Array<{ id: UUID; categoryName: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<{
    id?: UUID;
    categoryName: string;
  } | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryApi.getList({ page: 0, size: 100 });
      setCategories(res.data);
    } catch (err) {
      toast.error("Lỗi tải danh sách category");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (data: { categoryName: string }) => {
    try {
      await categoryApi.create(data);
      toast.success("Thêm category thành công");
      setShowForm(false);
      fetchCategories();
    } catch (err: any) {
      if (err.message?.includes("Conflict"))
        toast.error("Tên category đã tồn tại");
      else toast.error("Lỗi thêm category");
    }
  };

  const handleEdit = (cat: { id: UUID; categoryName: string }) => {
    setEditing(cat);
    setShowForm(true);
  };

  const handleUpdate = async (data: { id?: UUID; categoryName: string }) => {
    if (!data.id) return;
    try {
      await categoryApi.update(data.id, { categoryName: data.categoryName });
      toast.success("Cập nhật category thành công");
      setEditing(null);
      setShowForm(false);
      fetchCategories();
    } catch (err: any) {
      if (err.message?.includes("Conflict"))
        toast.error("Tên category đã tồn tại");
      else toast.error("Lỗi cập nhật category");
    }
  };

  const handleDelete = async (id: UUID) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa category này?")) return;
    try {
      await categoryApi.delete(id);
      toast.success("Xóa category thành công");
      fetchCategories();
    } catch {
      toast.error("Lỗi xóa category");
    }
  };

  return (
    <ProtectedRoute requiredRole={["ROLE_ADMIN", "ROLE_SELLER"]}>
      <div
        style={{
          maxWidth: 600,
          margin: "40px auto",
          background: "#fff",
          borderRadius: 8,
          boxShadow: "0 2px 8px #eee",
          padding: 24,
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: 24 }}>
          Quản lý Category
        </h2>
        {loading ? (
          <div>Đang tải...</div>
        ) : (
          <>
            <button
              onClick={() => {
                setShowForm(true);
                setEditing(null);
              }}
              style={{ marginBottom: 16 }}
            >
              Thêm category
            </button>
            {showForm && (
              <CategoryForm
                initial={editing || undefined}
                onSubmit={editing ? handleUpdate : handleAdd}
                onCancel={() => {
                  setShowForm(false);
                  setEditing(null);
                }}
              />
            )}
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: 16,
              }}
            >
              <thead>
                <tr>
                  <th style={{ borderBottom: "1px solid #ccc", padding: 8 }}>
                    Tên category
                  </th>
                  <th style={{ borderBottom: "1px solid #ccc", padding: 8 }}>
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                      {cat.categoryName}
                    </td>
                    <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                      <button
                        onClick={() => handleEdit(cat)}
                        style={{ marginRight: 8 }}
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        style={{ color: "red" }}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default Categories;
