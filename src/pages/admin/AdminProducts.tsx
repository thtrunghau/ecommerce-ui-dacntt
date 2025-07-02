/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import RoundedButton from "../../components/common/RoundedButton";
import toast, { Toaster } from "react-hot-toast";
import ErrorState from "../../components/common/ErrorState";
import {
  getPresignedPutUrl,
  uploadFileToS3,
  getPresignedGetUrl,
  productApi,
  categoryApi,
} from "../../services/apiService";
import AdminProductRowSkeleton from "../../components/common/AdminProductRowSkeleton";
import useAuthStore from "../../store/authStore";
import type { ProductResDto, ProductReqDto, UUID } from "../../types/api";
import { getProductImageUrl } from "../../utils/imageUtils";

const AdminProducts: React.FC = () => {
  const { user, authorities } = useAuthStore();
  const isAdminOrSeller =
    authorities.includes("admin") || authorities.includes("seller");

  const [products, setProducts] = useState<ProductResDto[]>([]);
  const [categories, setCategories] = useState<
    { id: string; categoryName: string }[]
  >([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductResDto | null>(null);
  const [form, setForm] = useState<ProductReqDto>({
    productName: "",
    price: 0,
    quantity: 0,
    description: "",
    image: "",
    categoryId: "" as UUID,
  });
  const [showDelete, setShowDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  // Fetch categories and products from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catRes, prodRes] = await Promise.all([
          categoryApi.getList(),
          productApi.getList(),
        ]);
        setCategories(
          catRes.data.map((c) => ({ id: c.id, categoryName: c.categoryName })),
        );
        setProducts(prodRes.data);
        setForm((f) => ({ ...f, categoryId: catRes.data[0]?.id || "" }));
      } catch (err) {
        setError("Không thể tải dữ liệu từ server");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = products.filter((p) =>
    p.productName.toLowerCase().includes(search.toLowerCase()),
  );

  const handleOpenForm = async (product?: ProductResDto) => {
    setEditProduct(product || null);
    setForm(
      product
        ? { ...product }
        : {
            productName: "",
            price: 0,
            quantity: 0,
            description: "",
            image: "",
            categoryId: categories[0]?.id || "",
          },
    );
    if (product?.image) {
      try {
        const { url } = await getPresignedGetUrl(product.image);
        setImagePreview(url);
      } catch {
        setImagePreview("");
      }
    } else {
      setImagePreview("");
    }
    setShowForm(true);
  };
  const handleCloseForm = () => {
    setShowForm(false);
    setEditProduct(null);
    setForm({
      productName: "",
      price: 0,
      quantity: 0,
      description: "",
      image: "",
      categoryId: categories[0]?.id || "",
    });
    setImagePreview("");
  };

  // Thêm/sửa sản phẩm (gọi API thật, chỉ cho phép admin/seller)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdminOrSeller) {
      toast.error("Bạn không có quyền thực hiện thao tác này");
      return;
    }
    setLoading(true);
    try {
      if (editProduct) {
        // Sửa sản phẩm
        await productApi.update(editProduct.id, form);
        setProducts((list) =>
          list.map((p) =>
            p.id === editProduct.id ? { ...editProduct, ...form } : p,
          ),
        );
        toast.success("Cập nhật sản phẩm thành công!");
      } else {
        // Thêm sản phẩm
        const res = await productApi.create(form);
        setProducts((list) => [...list, res]);
        toast.success("Thêm sản phẩm thành công!");
      }
      handleCloseForm();
    } catch (err: any) {
      toast.error(err?.message || "Có lỗi xảy ra khi lưu sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  // Xóa sản phẩm (chỉ cho phép admin/seller)
  const handleDelete = async (id: string) => {
    if (!isAdminOrSeller) {
      toast.error("Bạn không có quyền thực hiện thao tác này");
      return;
    }
    setLoading(true);
    try {
      await productApi.delete(id);
      setProducts((list) => list.filter((p) => p.id !== id));
      setShowDelete(null);
      toast.success("Xóa sản phẩm thành công!");
    } catch (err: any) {
      toast.error(err?.message || "Xóa sản phẩm thất bại!");
    } finally {
      setLoading(false);
    }
  };

  // Upload ảnh S3 chuẩn contract
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Chỉ cho phép upload file ảnh!");
      return;
    }
    setUploading(true);
    try {
      // Gọi API lấy presigned PUT URL upload (truyền đúng fileName và contentType)
      const { url, key, signedHeaders } = await getPresignedPutUrl(
        file.name,
        file.type,
      );
      await uploadFileToS3(url, file, signedHeaders);
      setForm((f) => ({ ...f, image: key })); // Lưu key trả về từ BE
      setImagePreview(URL.createObjectURL(file));
      toast.success("Upload ảnh thành công!");
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
            {isAdminOrSeller && (
              <button
                onClick={() => handleOpenForm()}
                className="rounded-full bg-black px-6 py-2 font-semibold text-white shadow transition hover:border hover:border-black hover:bg-white hover:text-black"
              >
                Thêm sản phẩm
              </button>
            )}
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <table className="w-full text-left">
              <thead>
                <tr className="text-base text-gray-500">
                  <th className="py-2">Hình ảnh</th>
                  <th className="py-2">Tên sản phẩm</th>
                  <th className="py-2">Giá</th>
                  <th className="py-2">Số lượng còn trong kho</th>
                  <th className="py-2">Hành động</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="border-t text-base transition hover:bg-gray-50"
                  >
                    <td className="py-2">
                      <img
                        src={getProductImageUrl(p.image)}
                        alt={p.productName}
                        className="h-14 w-14 rounded border object-cover"
                        onError={(e) =>
                          (e.currentTarget.src = getProductImageUrl())
                        }
                      />
                    </td>
                    <td className="py-2">{p.productName}</td>
                    <td className="py-2">{p.price.toLocaleString()}₫</td>
                    <td className="py-2">{p.quantity}</td>
                    <td className="py-2">
                      <div className="flex gap-2">
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
                            "&:hover": {
                              backgroundColor: "red",
                              color: "white",
                            },
                          }}
                          variant="contained"
                        />
                      </div>
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
                className="mx-2 w-full max-w-3xl rounded-xl bg-white p-2 shadow-xl sm:mx-auto sm:p-6"
              >
                <h2 className="mb-6 text-lg font-semibold">
                  {editProduct ? "Sửa sản phẩm" : "Thêm sản phẩm"}
                </h2>
                <div className="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2">
                  <label className="flex items-center gap-4">
                    <span className="w-32 font-medium">Tên sản phẩm</span>
                    <input
                      className="flex-1 rounded border px-2 py-1"
                      placeholder="Nhập tên sản phẩm"
                      value={form.productName}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, productName: e.target.value }))
                      }
                      required
                    />
                  </label>
                  <label className="flex items-center gap-4">
                    <span className="w-32 font-medium">Giá</span>
                    <input
                      className="flex-1 rounded border px-2 py-1"
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
                  <label className="flex items-center gap-4">
                    <span className="w-32 font-medium">Số lượng</span>
                    <input
                      className="flex-1 rounded border px-2 py-1"
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
                  <label className="flex items-center gap-4">
                    <span className="w-32 font-medium">Danh mục</span>
                    <select
                      className="flex-1 rounded border px-2 py-1"
                      value={form.categoryId}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, categoryId: e.target.value }))
                      }
                      required
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.categoryName}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-2 md:col-span-2">
                    <span className="font-medium">Mô tả sản phẩm</span>
                    <textarea
                      className="rounded border px-2 py-1"
                      placeholder="Nhập mô tả sản phẩm"
                      value={form.description}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, description: e.target.value }))
                      }
                      required
                    />
                  </label>
                  <label className="flex flex-col gap-2 md:col-span-2">
                    <span className="font-medium">Ảnh sản phẩm</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      className="rounded border px-2 py-1"
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
                          src={imagePreview}
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
                <div className="mt-6 flex justify-end gap-2">
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
