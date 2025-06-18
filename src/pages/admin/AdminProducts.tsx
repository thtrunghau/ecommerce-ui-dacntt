import React, { useState } from "react";
import RoundedButton from "../../components/common/RoundedButton";
import toast, { Toaster } from "react-hot-toast";
import ErrorState from "../../components/common/ErrorState";
import { getPresignedUrl, uploadFileToS3 } from "../../services/apiService";
import AdminProductRowSkeleton from "../../components/common/AdminProductRowSkeleton";

// Thêm mock categories để chọn categoryId
const mockCategories = [
  { id: "c1", categoryName: "Điện thoại" },
  { id: "c2", categoryName: "Laptop" },
  { id: "c3", categoryName: "Phụ kiện" },
];

interface Product {
  id: string;
  productName: string;
  price: number;
  quantity: number;
  status: string;
  description: string;
  image: string;
  categoryId: string;
}

// Giả lập dữ liệu sản phẩm
const mockProducts: Product[] = [
  {
    id: "1",
    productName: "iPhone 15 Pro Max",
    price: 34990000,
    quantity: 12,
    status: "Hiển thị",
    description: "Điện thoại cao cấp của Apple",
    image: "",
    categoryId: "c1",
  },
  {
    id: "2",
    productName: "Samsung S24 Ultra",
    price: 29990000,
    quantity: 8,
    status: "Ẩn",
    description: "Điện thoại cao cấp của Samsung",
    image: "",
    categoryId: "c1",
  },
  {
    id: "3",
    productName: "MacBook Air M3",
    price: 27990000,
    quantity: 5,
    status: "Hiển thị",
    description: "Laptop mỏng nhẹ của Apple",
    image: "",
    categoryId: "c2",
  },
];

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({
    productName: "",
    price: 0,
    quantity: 0,
    status: "Hiển thị",
    description: "",
    image: "",
    categoryId: mockCategories[0].id,
  });
  const [showDelete, setShowDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  // Thêm state loading/error để demo tích hợp
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const filtered = products.filter((p) =>
    p.productName.toLowerCase().includes(search.toLowerCase()),
  );

  const handleOpenForm = (product?: Product) => {
    setEditProduct(product || null);
    setForm(
      product
        ? { ...product }
        : {
            productName: "",
            price: 0,
            quantity: 0,
            status: "Hiển thị",
            description: "",
            image: "",
            categoryId: mockCategories[0].id,
          },
    );
    setShowForm(true);
  };
  const handleCloseForm = () => {
    setShowForm(false);
    setEditProduct(null);
    setForm({
      productName: "",
      price: 0,
      quantity: 0,
      status: "Hiển thị",
      description: "",
      image: "",
      categoryId: mockCategories[0].id,
    });
  };
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editProduct) {
        setProducts((list) =>
          list.map((p) =>
            p.id === editProduct.id ? { ...editProduct, ...form } : p,
          ),
        );
        toast.success("Cập nhật sản phẩm thành công!");
      } else {
        setProducts((list) => [
          ...list,
          { ...form, id: Date.now().toString() },
        ]);
        toast.success("Thêm sản phẩm thành công!");
      }
      handleCloseForm();
    } catch {
      toast.error("Có lỗi xảy ra khi lưu sản phẩm!");
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = (id: string) => {
    try {
      setLoading(true);
      setProducts((list) => list.filter((p) => p.id !== id));
      setShowDelete(null);
      toast.success("Xóa sản phẩm thành công!");
    } catch {
      toast.error("Xóa sản phẩm thất bại!");
    } finally {
      setLoading(false);
    }
  };
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Chỉ cho phép upload file ảnh!");
      return;
    }
    setUploading(true);
    try {
      // Lấy presigned URL từ backend
      const presignedUrl = await getPresignedUrl(file.name);
      // Upload file lên S3
      await uploadFileToS3(presignedUrl, file);
      // Set tên file vào form, preview ảnh
      setForm((f) => ({ ...f, image: file.name }));
      setImagePreview(URL.createObjectURL(file));
      toast.success("Upload ảnh thành công!");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast.error("Upload ảnh thất bại!");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-2 py-8">
      <Toaster position="top-right" />
      {/* <button
        onClick={() => navigate("/")}
        className="mb-4 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow hover:bg-gray-100"
      >
        ← Về trang chủ
      </button> */}
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-gray-900">
        Quản lý sản phẩm
      </h1>
      {loading ? (
        <div className="rounded-2xl bg-white p-6 shadow-lg">
          <table className="w-full text-left">
            <thead>
              <tr className="text-base text-gray-500">
                <th className="py-2">Tên sản phẩm</th>
                <th className="py-2">Giá</th>
                <th className="py-2">Số lượng tồn kho</th>
                <th className="py-2">Trạng thái</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, i) => (
                <AdminProductRowSkeleton key={i} />
              ))}
            </tbody>
          </table>
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => setError(null)} />
      ) : (
        <>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <input
              className="w-full rounded-full border border-gray-300 bg-white px-5 py-2 text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-black focus:ring-2 focus:ring-black/20 sm:w-80"
              placeholder="Tìm kiếm sản phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              onClick={() => handleOpenForm()}
              className="rounded-full bg-black px-6 py-2 font-semibold text-white shadow transition hover:border hover:border-black hover:bg-white hover:text-black"
            >
              Thêm sản phẩm
            </button>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <table className="w-full text-left">
              <thead>
                <tr className="text-base text-gray-500">
                  <th className="py-2">Tên sản phẩm</th>
                  <th className="py-2">Giá</th>
                  <th className="py-2">Số lượng tồn kho</th>
                  <th className="py-2">Trạng thái</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="border-t text-base transition hover:bg-gray-50"
                  >
                    <td className="py-2">{p.productName}</td>
                    <td className="py-2">{p.price.toLocaleString()}₫</td>
                    <td className="py-2">{p.quantity}</td>
                    <td className="py-2">{p.status}</td>
                    <td className="py-2">
                      <RoundedButton
                        text="Sửa"
                        onClick={() => handleOpenForm(p)}
                        size="small"
                        sx={{
                          mr: 1,
                          minWidth: 0,
                          fontWeight: 500,
                          fontSize: "0.75rem",
                          padding: "2px 12px",
                          backgroundColor: "white",
                          color: "black",
                          border: "1px solid black",
                          "&:hover": {
                            backgroundColor: "black",
                            color: "white",
                          },
                        }}
                        variant="contained"
                      />
                      <RoundedButton
                        text="Xóa"
                        onClick={() =>
                          setShowDelete({ id: p.id, name: p.productName })
                        }
                        size="small"
                        sx={{
                          minWidth: 0,
                          fontWeight: 500,
                          fontSize: "0.75rem",
                          padding: "2px 12px",
                          backgroundColor: "white",
                          color: "red",
                          border: "1px solid red",
                          "&:hover": { backgroundColor: "red", color: "white" },
                        }}
                        variant="contained"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Form thêm/sửa sản phẩm */}
          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <form
                onSubmit={handleSave}
                className="mx-2 grid max-h-screen w-full max-w-3xl grid-cols-1 gap-2 overflow-y-auto rounded-xl bg-white p-2 shadow-xl sm:mx-auto sm:gap-4 sm:p-6 md:grid-cols-2"
              >
                <h2 className="col-span-1 mb-4 text-lg font-semibold md:col-span-2">
                  {editProduct ? "Sửa sản phẩm" : "Thêm sản phẩm"}
                </h2>
                <div className="space-y-3">
                  <label className="block">
                    <span className="font-medium">Tên sản phẩm</span>
                    <input
                      className="mt-1 w-full rounded border px-2 py-1"
                      placeholder="Nhập tên sản phẩm"
                      value={form.productName}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, productName: e.target.value }))
                      }
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="font-medium">Giá</span>
                    <input
                      className="mt-1 w-full rounded border px-2 py-1"
                      placeholder="Nhập giá sản phẩm"
                      type="number"
                      min={0}
                      value={form.price}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          price: Number(e.target.value),
                        }))
                      }
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="font-medium">Số lượng tồn kho</span>
                    <input
                      className="mt-1 w-full rounded border px-2 py-1"
                      placeholder="Nhập số lượng tồn kho"
                      type="number"
                      min={0}
                      value={form.quantity}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          quantity: Number(e.target.value),
                        }))
                      }
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="font-medium">Trạng thái hiển thị</span>
                    <select
                      className="mt-1 w-full rounded border px-2 py-1"
                      value={form.status}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, status: e.target.value }))
                      }
                    >
                      <option value="Hiển thị">Hiển thị</option>
                      <option value="Ẩn">Ẩn</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="font-medium">Danh mục sản phẩm</span>
                    <select
                      className="mt-1 w-full rounded border px-2 py-1"
                      value={form.categoryId}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, categoryId: e.target.value }))
                      }
                      required
                    >
                      {mockCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.categoryName}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="space-y-3">
                  <label className="block md:col-span-2">
                    <span className="font-medium">Mô tả sản phẩm</span>
                    <textarea
                      className="mt-1 w-full rounded border px-2 py-1"
                      placeholder="Nhập mô tả sản phẩm"
                      value={form.description}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, description: e.target.value }))
                      }
                      required
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="font-medium">Ảnh sản phẩm</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      className="mt-1 w-full rounded border px-2 py-1"
                      onChange={handleFileChange}
                      disabled={uploading}
                    />
                    {uploading && (
                      <span className="text-xs text-blue-500">
                        Đang upload...
                      </span>
                    )}
                    {form.image && (
                      <div className="mt-2 flex items-center gap-2">
                        <img
                          src={
                            imagePreview ||
                            `/api/s3/presigned-url?key=${encodeURIComponent(
                              form.image,
                            )}&contentDisposition=inline`
                          }
                          alt="Ảnh sản phẩm"
                          className="h-16 w-16 rounded border object-cover"
                        />
                        <span className="text-xs text-gray-600">
                          {form.image}
                        </span>
                      </div>
                    )}
                  </label>
                </div>
                <div className="col-span-1 mt-4 flex gap-2 md:col-span-2">
                  <RoundedButton
                    text="Lưu"
                    type="submit"
                    sx={{ minWidth: 0, fontWeight: 600 }}
                  />
                  <RoundedButton
                    text="Hủy"
                    type="button"
                    onClick={handleCloseForm}
                    sx={{
                      minWidth: 0,
                      backgroundColor: "white",
                      color: "black",
                      border: "1px solid black",
                      "&:hover": { backgroundColor: "#eee", color: "black" },
                    }}
                    variant="contained"
                  />
                </div>
              </form>
            </div>
          )}
          {/* Xác nhận xóa */}
          {showDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
                <RoundedButton
                  text="×"
                  type="button"
                  onClick={() => setShowDelete(null)}
                  sx={{
                    position: "absolute",
                    right: 8,
                    top: 8,
                    minWidth: 0,
                    width: 32,
                    height: 32,
                    fontSize: 24,
                    backgroundColor: "white",
                    color: "black",
                    border: "none",
                    boxShadow: "none",
                    "&:hover": { backgroundColor: "#eee", color: "black" },
                  }}
                  variant="text"
                />
                <h2 className="mb-4 text-lg font-semibold text-red-600">
                  Xác nhận xóa
                </h2>
                <p>
                  Bạn có chắc chắn muốn xóa sản phẩm <b>{showDelete.name}</b>?
                </p>
                <div className="mt-4 flex gap-2">
                  <RoundedButton
                    text="Xóa"
                    onClick={() => handleDelete(showDelete.id)}
                    sx={{
                      minWidth: 0,
                      fontWeight: 600,
                      backgroundColor: "red",
                      color: "white",
                      border: "1px solid red",
                      "&:hover": { backgroundColor: "white", color: "red" },
                    }}
                    variant="contained"
                  />
                  <RoundedButton
                    text="Hủy"
                    onClick={() => setShowDelete(null)}
                    sx={{
                      minWidth: 0,
                      backgroundColor: "white",
                      color: "black",
                      border: "1px solid black",
                      "&:hover": { backgroundColor: "#eee", color: "black" },
                    }}
                    variant="contained"
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminProducts;
