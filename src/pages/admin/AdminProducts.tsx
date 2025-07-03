/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
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
import {
  parseProductDescription,
  stringifyProductDescription,
  createEmptyProductDescription,
  filterValidColors,
} from "../../utils/productDescriptionUtils";
import AdminProductRowSkeleton from "../../components/common/AdminProductRowSkeleton";
import useAuthStore from "../../store/authStore";
import type {
  ProductResDto,
  ProductReqDto,
  UUID,
  ProductDescriptionJson,
} from "../../types/api";
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
  // New state for parsed description form
  const [descriptionForm, setDescriptionForm] =
    useState<ProductDescriptionJson>(createEmptyProductDescription());
  const [attributes, setAttributes] = useState<
    Array<{ key: string; value: string }>
  >([]);
  const [colors, setColors] = useState<string[]>([]);
  const [showDelete, setShowDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoPreview, setVideoPreview] = useState<string>("");
  const [videoInputMode, setVideoInputMode] = useState<"link" | "upload">(
    "link",
  );
  const isVideoFromUpload = useRef(false);

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

  // Update video preview when link_video changes
  useEffect(() => {
    const updateVideoPreview = async () => {
      if (!descriptionForm.link_video) {
        setVideoPreview("");
        isVideoFromUpload.current = false;
        return;
      }

      // If it's from file upload, don't override it
      if (isVideoFromUpload.current) {
        return;
      }

      if (descriptionForm.link_video.startsWith("http")) {
        // It's a direct URL, use it directly
        setVideoPreview(descriptionForm.link_video);
      } else {
        // It's an S3 key, get presigned URL
        try {
          const { url } = await getPresignedGetUrl(descriptionForm.link_video);
          setVideoPreview(url);
        } catch {
          setVideoPreview("");
        }
      }
    };

    updateVideoPreview();
  }, [descriptionForm.link_video]);

  const filtered = products.filter((p) =>
    p.productName.toLowerCase().includes(search.toLowerCase()),
  );

  const handleOpenForm = async (product?: ProductResDto) => {
    setEditProduct(product || null);

    if (product) {
      setForm({ ...product });
      // Parse existing description
      const parsed = parseProductDescription(product.description || "");
      setDescriptionForm(parsed);
      // Set attributes array
      setAttributes(
        parsed.attribute
          ? Object.entries(parsed.attribute).map(([key, value]) => ({
              key,
              value,
            }))
          : [],
      );
      // Set colors array
      setColors(parsed.color || []);

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

      // Set video input mode based on existing data
      if (parsed.link_video) {
        if (parsed.link_video.startsWith("http")) {
          setVideoInputMode("link");
        } else {
          setVideoInputMode("upload");
        }
      } else {
        setVideoInputMode("link");
      }
    } else {
      // New product - reset everything
      setForm({
        productName: "",
        price: 0,
        quantity: 0,
        description: "",
        image: "",
        categoryId: categories[0]?.id || "",
      });
      setDescriptionForm(createEmptyProductDescription());
      setAttributes([]);
      setColors([]);
      setImagePreview("");
      setVideoPreview("");
      setVideoInputMode("link");
      isVideoFromUpload.current = false;
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
    setDescriptionForm(createEmptyProductDescription());
    setAttributes([]);
    setColors([]);
    setImagePreview("");
    setVideoPreview("");
    setVideoInputMode("link");
    isVideoFromUpload.current = false;
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
      // Prepare description JSON
      const finalDescriptionForm: ProductDescriptionJson = {
        ...descriptionForm,
        color: filterValidColors(colors),
        attribute: attributes.reduce(
          (acc, attr) => {
            if (attr.key.trim() && attr.value.trim()) {
              acc[attr.key.trim()] = attr.value.trim();
            }
            return acc;
          },
          {} as Record<string, string>,
        ),
      };

      // Convert to string for backend
      const descriptionString =
        stringifyProductDescription(finalDescriptionForm);

      const formData = {
        ...form,
        description: descriptionString,
      };

      if (editProduct) {
        // Sửa sản phẩm
        await productApi.update(editProduct.id, formData);
        setProducts((list) =>
          list.map((p) =>
            p.id === editProduct.id ? { ...editProduct, ...formData } : p,
          ),
        );
        toast.success("Cập nhật sản phẩm thành công!");
      } else {
        // Thêm sản phẩm
        const res = await productApi.create(formData);
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

  // Helper functions for dynamic form handling
  const addAttribute = () => {
    setAttributes([...attributes, { key: "", value: "" }]);
  };

  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const updateAttribute = (
    index: number,
    field: "key" | "value",
    value: string,
  ) => {
    const newAttributes = [...attributes];
    newAttributes[index][field] = value;
    setAttributes(newAttributes);
  };

  const addColor = () => {
    setColors([...colors, "#000000"]);
  };

  const removeColor = (index: number) => {
    setColors(colors.filter((_, i) => i !== index));
  };

  const updateColor = (index: number, value: string) => {
    const newColors = [...colors];
    newColors[index] = value;
    setColors(newColors);
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

  // Upload video S3 chuẩn contract
  const handleVideoFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      toast.error("Chỉ cho phép upload file video!");
      return;
    }
    // Check file size (limit to 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error("File video không được vượt quá 50MB!");
      return;
    }
    setUploadingVideo(true);
    try {
      // Gọi API lấy presigned PUT URL upload (truyền đúng fileName và contentType)
      const { url, key, signedHeaders } = await getPresignedPutUrl(
        file.name,
        file.type,
      );
      await uploadFileToS3(url, file, signedHeaders);
      // Update description form with the S3 key
      setDescriptionForm((prev) => ({
        ...prev,
        link_video: key,
      }));
      // Set preview immediately from the file object
      setVideoPreview(URL.createObjectURL(file));
      isVideoFromUpload.current = true;
      toast.success("Upload video thành công!");
    } catch (err) {
      toast.error("Upload video thất bại!");
    } finally {
      setUploadingVideo(false);
    }
  };

  // Handle video input mode change
  const handleVideoModeChange = (mode: "link" | "upload") => {
    setVideoInputMode(mode);
    // Clear current video when switching modes
    setDescriptionForm((prev) => ({
      ...prev,
      link_video: undefined,
    }));
    setVideoPreview("");
    isVideoFromUpload.current = false;
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
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
              <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-xl bg-white shadow-xl">
                <form onSubmit={handleSave} className="p-6">
                  <div className="sticky top-0 z-10 border-b bg-white pb-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold">
                        {editProduct ? "Sửa sản phẩm" : "Thêm sản phẩm"}
                      </h2>
                      <button
                        type="button"
                        onClick={handleCloseForm}
                        className="rounded-full p-2 hover:bg-gray-100"
                      >
                        <svg
                          className="h-6 w-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 space-y-8">
                    {/* Thông tin cơ bản */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                      <div className="space-y-4 lg:col-span-2">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                              Tên sản phẩm *
                            </label>
                            <input
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Nhập tên sản phẩm"
                              value={form.productName}
                              onChange={(e) =>
                                setForm((f) => ({
                                  ...f,
                                  productName: e.target.value,
                                }))
                              }
                              required
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                              Danh mục *
                            </label>
                            <select
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={form.categoryId}
                              onChange={(e) =>
                                setForm((f) => ({
                                  ...f,
                                  categoryId: e.target.value,
                                }))
                              }
                              required
                            >
                              {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.categoryName}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                              Giá *
                            </label>
                            <input
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                          </div>
                          <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                              Số lượng *
                            </label>
                            <input
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                          </div>
                        </div>

                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">
                            Tóm tắt sản phẩm
                          </label>
                          <input
                            type="text"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nhập tóm tắt ngắn gọn về sản phẩm"
                            value={descriptionForm.summary}
                            onChange={(e) =>
                              setDescriptionForm((prev) => ({
                                ...prev,
                                summary: e.target.value,
                              }))
                            }
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">
                            Mô tả chi tiết sản phẩm *
                          </label>
                          <textarea
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nhập mô tả chi tiết sản phẩm"
                            rows={4}
                            value={descriptionForm.description}
                            onChange={(e) =>
                              setDescriptionForm((prev) => ({
                                ...prev,
                                description: e.target.value,
                              }))
                            }
                            required
                          />
                        </div>
                      </div>

                      {/* Ảnh sản phẩm */}
                      <div className="lg:col-span-1">
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                          Ảnh sản phẩm *
                        </label>
                        <div className="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center transition-colors hover:border-gray-400">
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/jpg"
                            className="hidden"
                            id="image-upload"
                            onChange={handleFileChange}
                            disabled={uploading}
                          />
                          <label
                            htmlFor="image-upload"
                            className="flex cursor-pointer flex-col items-center"
                          >
                            {form.image ? (
                              <img
                                src={imagePreview}
                                alt="Ảnh sản phẩm"
                                className="mb-2 h-48 w-full rounded-lg object-cover"
                              />
                            ) : (
                              <div className="mb-2 flex h-48 w-full items-center justify-center rounded-lg bg-gray-50">
                                <svg
                                  className="h-12 w-12 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                            )}
                            <span className="text-sm text-gray-500">
                              {uploading
                                ? "Đang upload..."
                                : "Chọn ảnh sản phẩm"}
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Video Section */}
                    <div className="rounded-lg bg-gray-50 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700">
                          Video sản phẩm (tùy chọn)
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleVideoModeChange("link")}
                            className={`rounded-lg px-3 py-1 text-sm transition-colors ${
                              videoInputMode === "link"
                                ? "bg-blue-500 text-white"
                                : "bg-white text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            Nhập link
                          </button>
                          <button
                            type="button"
                            onClick={() => handleVideoModeChange("upload")}
                            className={`rounded-lg px-3 py-1 text-sm transition-colors ${
                              videoInputMode === "upload"
                                ? "bg-blue-500 text-white"
                                : "bg-white text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            Upload file
                          </button>
                        </div>
                      </div>

                      {videoInputMode === "link" ? (
                        <input
                          type="url"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://example.com/video.mp4 hoặc https://youtube.com/watch?v=..."
                          value={descriptionForm.link_video || ""}
                          onChange={(e) =>
                            setDescriptionForm((prev) => ({
                              ...prev,
                              link_video: e.target.value || undefined,
                            }))
                          }
                        />
                      ) : (
                        <div className="space-y-2">
                          <input
                            type="file"
                            accept="video/mp4,video/avi,video/mov,video/wmv,video/webm"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={handleVideoFileChange}
                            disabled={uploadingVideo}
                          />
                          {uploadingVideo && (
                            <span className="text-sm text-blue-500">
                              Đang upload video...
                            </span>
                          )}
                        </div>
                      )}

                      {descriptionForm.link_video && (
                        <div className="mt-3 flex items-center gap-3 rounded-lg bg-white p-3">
                          {videoPreview ? (
                            <video
                              src={videoPreview}
                              className="h-16 w-24 rounded border object-cover"
                              controls
                            />
                          ) : (
                            <div className="flex h-16 w-24 items-center justify-center rounded border bg-gray-100">
                              <span className="text-xs text-gray-500">
                                Video
                              </span>
                            </div>
                          )}
                          <div className="flex-1">
                            <span className="break-all text-sm text-gray-600">
                              {descriptionForm.link_video.startsWith("http")
                                ? "Link: " + descriptionForm.link_video
                                : "File: " + descriptionForm.link_video}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setDescriptionForm((prev) => ({
                                ...prev,
                                link_video: undefined,
                              }));
                              setVideoPreview("");
                              isVideoFromUpload.current = false;
                            }}
                            className="rounded-lg bg-red-500 px-3 py-1 text-sm text-white transition-colors hover:bg-red-600"
                          >
                            Xóa
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Colors and Attributes */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      {/* Colors Section */}
                      <div className="rounded-lg bg-blue-50 p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <label className="block text-sm font-medium text-gray-700">
                            Màu sắc sản phẩm
                          </label>
                          <button
                            type="button"
                            onClick={addColor}
                            className="rounded-lg bg-blue-500 px-3 py-1 text-sm text-white transition-colors hover:bg-blue-600"
                          >
                            + Thêm màu
                          </button>
                        </div>
                        <div className="max-h-40 space-y-2 overflow-y-auto">
                          {colors.map((color, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 rounded bg-white p-2"
                            >
                              <input
                                type="color"
                                value={color}
                                onChange={(e) =>
                                  updateColor(index, e.target.value)
                                }
                                className="h-8 w-12 rounded border"
                              />
                              <input
                                type="text"
                                value={color}
                                onChange={(e) =>
                                  updateColor(index, e.target.value)
                                }
                                className="flex-1 rounded border px-2 py-1"
                                placeholder="#000000"
                              />
                              <button
                                type="button"
                                onClick={() => removeColor(index)}
                                className="rounded bg-red-500 px-2 py-1 text-sm text-white transition-colors hover:bg-red-600"
                              >
                                Xóa
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Attributes Section */}
                      <div className="rounded-lg bg-green-50 p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <label className="block text-sm font-medium text-gray-700">
                            Thuộc tính sản phẩm
                          </label>
                          <button
                            type="button"
                            onClick={addAttribute}
                            className="rounded-lg bg-green-500 px-3 py-1 text-sm text-white transition-colors hover:bg-green-600"
                          >
                            + Thêm thuộc tính
                          </button>
                        </div>
                        <div className="max-h-40 space-y-2 overflow-y-auto">
                          {attributes.map((attr, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 rounded bg-white p-2"
                            >
                              <input
                                type="text"
                                value={attr.key}
                                onChange={(e) =>
                                  updateAttribute(index, "key", e.target.value)
                                }
                                className="flex-1 rounded border px-2 py-1"
                                placeholder="Tên thuộc tính"
                              />
                              <input
                                type="text"
                                value={attr.value}
                                onChange={(e) =>
                                  updateAttribute(
                                    index,
                                    "value",
                                    e.target.value,
                                  )
                                }
                                className="flex-1 rounded border px-2 py-1"
                                placeholder="Giá trị"
                              />
                              <button
                                type="button"
                                onClick={() => removeAttribute(index)}
                                className="rounded bg-red-500 px-2 py-1 text-sm text-white transition-colors hover:bg-red-600"
                              >
                                Xóa
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="sticky bottom-0 mt-6 flex justify-end gap-3 border-t bg-white pt-4">
                    <RoundedButton
                      text="Hủy"
                      type="button"
                      onClick={handleCloseForm}
                      sx={{
                        minWidth: 100,
                        backgroundColor: "white",
                        color: "black",
                        border: "1px solid #d1d5db",
                        "&:hover": {
                          backgroundColor: "#f3f4f6",
                          color: "black",
                        },
                      }}
                      variant="contained"
                    />
                    <RoundedButton
                      text="Lưu"
                      type="submit"
                      sx={{ minWidth: 100, fontWeight: 600 }}
                    />
                  </div>
                </form>
              </div>
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
