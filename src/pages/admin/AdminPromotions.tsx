import React, { useState, useEffect } from "react";
import RoundedButton from "../../components/common/RoundedButton";
import toast, { Toaster } from "react-hot-toast";
import ErrorState from "../../components/common/ErrorState";
import AdminPromotionRowSkeleton from "../../components/common/AdminPromotionRowSkeleton";
import { promotionApi, productApi } from "../../services/apiService";
import type {
  PromotionResDto,
  PromotionReqDto,
  ProductResDto,
  PromotionType,
  ProportionType,
} from "../../types/api";

const AdminPromotions: React.FC = () => {
  const [promotions, setPromotions] = useState<PromotionResDto[]>([]);
  const [products, setProducts] = useState<ProductResDto[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editPromo, setEditPromo] = useState<PromotionResDto | null>(null);
  const [form, setForm] = useState<PromotionReqDto>({
    promotionCode: "",
    promotionName: "",
    description: "",
    startDate: "",
    endDate: "",
    discountAmount: 0,
    promotionType: "ALL_PRODUCTS",
    proportionType: "PERCENTAGE",
    minOrderValue: 0,
    productIds: [],
  });
  const [showDelete, setShowDelete] = useState<{
    id: string;
    code: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch promotions and products from API on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [promoRes, prodRes] = await Promise.all([
          promotionApi.getList(),
          productApi.getList(),
        ]);
        setPromotions(promoRes.data || []);
        setProducts(prodRes.data || []);
      } catch (err: unknown) {
        setError((err as Error)?.message || "Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = promotions.filter(
    (p) =>
      p.promotionCode.toLowerCase().includes(search.toLowerCase()) ||
      p.promotionName.toLowerCase().includes(search.toLowerCase()),
  );

  const handleOpenForm = (promo?: PromotionResDto) => {
    setEditPromo(promo || null);
    setForm(
      promo
        ? {
            promotionCode: promo.promotionCode,
            promotionName: promo.promotionName,
            description: promo.description,
            startDate: promo.startDate,
            endDate: promo.endDate,
            discountAmount: promo.discountAmount ?? 0,
            promotionType: promo.promotionType,
            proportionType: promo.proportionType,
            minOrderValue: promo.minOrderValue ?? 0,
            productIds: promo.productIds ?? [],
          }
        : {
            promotionCode: "",
            promotionName: "",
            description: "",
            startDate: "",
            endDate: "",
            discountAmount: 0,
            promotionType: "ALL_PRODUCTS",
            proportionType: "PERCENTAGE",
            minOrderValue: 0,
            productIds: [],
          },
    );
    setShowForm(true);
  };
  const handleCloseForm = () => {
    setShowForm(false);
    setEditPromo(null);
    setForm({
      promotionCode: "",
      promotionName: "",
      description: "",
      startDate: "",
      endDate: "",
      discountAmount: 0,
      promotionType: "ALL_PRODUCTS",
      proportionType: "PERCENTAGE",
      minOrderValue: 0,
      productIds: [],
    });
  };
  const toISOStringWithZ = (localDateTime: string) => {
    if (!localDateTime) return "";
    // localDateTime: "2025-06-29T10:56"
    const date = new Date(localDateTime);
    return date.toISOString(); // always ends with 'Z'
  };
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToSend = {
        ...form,
        startDate: toISOStringWithZ(form.startDate),
        endDate: toISOStringWithZ(form.endDate),
      };
      if (editPromo) {
        // Update: Use update API for editing
        await promotionApi.update(editPromo.id, dataToSend);
        toast.success("Cập nhật khuyến mãi thành công!");
      } else {
        // Create
        await promotionApi.create(dataToSend);
        toast.success("Thêm khuyến mãi thành công!");
      }
      // Reload list
      const res = await promotionApi.getList();
      setPromotions(res.data || []);
      handleCloseForm();
    } catch (err: unknown) {
      toast.error(
        (err as Error)?.message || "Có lỗi xảy ra khi lưu khuyến mãi!",
      );
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await promotionApi.delete?.(id);
      toast.success("Xóa khuyến mãi thành công!");
      // Reload list
      const res = await promotionApi.getList();
      setPromotions(res.data || []);
      setShowDelete(null);
    } catch (err: unknown) {
      toast.error((err as Error)?.message || "Xóa khuyến mãi thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const getPromotionStatus = (promo: PromotionResDto): string => {
    const now = new Date();
    const start = new Date(promo.startDate);
    const end = new Date(promo.endDate);
    if (now < start) return "Chưa bắt đầu";
    if (now > end) return "Hết hạn";
    return "Đang hoạt động";
  };

  return (
    <div className="mx-auto max-w-5xl px-2 py-8">
      <Toaster position="top-right" />
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-gray-900">
        Quản lý khuyến mãi
      </h1>
      {loading ? (
        <div className="rounded-2xl bg-white p-6 shadow-lg">
          <table className="w-full text-left">
            <thead>
              <tr className="text-base text-gray-500">
                <th className="py-2">Mã</th>
                <th className="py-2">Tên chương trình</th>
                <th className="py-2">Trạng thái</th>
                <th className="py-2">Bắt đầu</th>
                <th className="py-2">Kết thúc</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <AdminPromotionRowSkeleton key={i} />
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
              placeholder="Tìm kiếm mã hoặc tên khuyến mãi..."
              value={search}
              onChange={handleSearchChange}
            />
            <button
              onClick={() => handleOpenForm()}
              className="rounded-full bg-black px-6 py-2 font-semibold text-white shadow transition hover:border hover:border-black hover:bg-white hover:text-black"
            >
              Thêm khuyến mãi
            </button>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <table className="w-full text-left">
              <thead>
                <tr className="text-base text-gray-500">
                  <th className="py-2">Mã</th>
                  <th className="py-2">Tên chương trình</th>
                  <th className="py-2">Trạng thái</th>
                  <th className="py-2">Bắt đầu</th>
                  <th className="py-2">Kết thúc</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      Không có khuyến mãi nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr
                      key={p.id}
                      className="border-t text-base transition hover:bg-gray-50"
                    >
                      <td className="py-2">{p.promotionCode}</td>
                      <td className="py-2">{p.promotionName}</td>
                      <td className="py-2">{getPromotionStatus(p)}</td>
                      <td className="py-2">{p.startDate}</td>
                      <td className="py-2">{p.endDate}</td>
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
                            setShowDelete({ id: p.id, code: p.promotionCode })
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
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Form thêm/sửa khuyến mãi */}
          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <form
                onSubmit={handleSave}
                className="mx-2 grid max-h-screen w-full max-w-3xl grid-cols-1 gap-2 overflow-y-auto rounded-xl bg-white p-2 shadow-xl sm:mx-auto sm:gap-4 sm:p-6 md:grid-cols-2"
              >
                <h2 className="col-span-1 mb-4 text-lg font-semibold md:col-span-2">
                  {editPromo ? "Sửa khuyến mãi" : "Thêm khuyến mãi"}
                </h2>
                <div className="space-y-3">
                  <label className="block">
                    <span className="font-medium">Mã khuyến mãi</span>
                    <input
                      className="mt-1 w-full rounded border px-2 py-1"
                      placeholder="Nhập mã khuyến mãi"
                      value={form.promotionCode}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          promotionCode: e.target.value,
                        }))
                      }
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="font-medium">Tên chương trình</span>
                    <input
                      className="mt-1 w-full rounded border px-2 py-1"
                      placeholder="Nhập tên chương trình"
                      value={form.promotionName}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          promotionName: e.target.value,
                        }))
                      }
                      required
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="font-medium">Mô tả chương trình</span>
                    <textarea
                      className="mt-1 w-full rounded border px-2 py-1"
                      placeholder="Nhập mô tả chương trình"
                      value={form.description}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, description: e.target.value }))
                      }
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="font-medium">
                      Số tiền giảm/Phần trăm giảm
                    </span>
                    <input
                      className="mt-1 w-full rounded border px-2 py-1"
                      placeholder="Nhập số tiền hoặc phần trăm giảm"
                      type="number"
                      min={0}
                      value={form.discountAmount || 0}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          discountAmount: Number(e.target.value),
                        }))
                      }
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="font-medium">Loại khuyến mãi</span>
                    <select
                      className="mt-1 w-full rounded border px-2 py-1"
                      value={form.promotionType}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          promotionType: e.target.value as PromotionType,
                        }))
                      }
                      required
                    >
                      <option value="ALL_PRODUCTS">Tất cả sản phẩm</option>
                      <option value="ORDER_TOTAL">Tổng đơn hàng</option>
                      <option value="SPECIFIC_PRODUCTS">Sản phẩm cụ thể</option>
                    </select>
                  </label>
                  {form.promotionType === "SPECIFIC_PRODUCTS" && (
                    <label className="block md:col-span-2">
                      <span className="font-medium">Chọn sản phẩm áp dụng</span>
                      <select
                        multiple
                        className="mt-1 w-full rounded border px-2 py-1"
                        value={form.productIds as string[]}
                        onChange={(e) => {
                          const selected = Array.from(
                            e.target.selectedOptions,
                          ).map((opt) => opt.value);
                          setForm((f) => ({ ...f, productIds: selected }));
                        }}
                      >
                        {products.map((prod) => (
                          <option key={prod.id} value={prod.id}>
                            {prod.productName}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>
                <div className="space-y-3">
                  <label className="block">
                    <span className="font-medium">Kiểu giảm giá</span>
                    <select
                      className="mt-1 w-full rounded border px-2 py-1"
                      value={form.proportionType}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          proportionType: e.target.value as ProportionType,
                        }))
                      }
                      required
                    >
                      <option value="PERCENTAGE">Phần trăm</option>
                      <option value="ABSOLUTE">Số tiền cố định</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="font-medium">Giá trị đơn tối thiểu</span>
                    <input
                      className="mt-1 w-full rounded border px-2 py-1"
                      placeholder="Nhập giá trị đơn tối thiểu"
                      type="number"
                      min={0}
                      value={form.minOrderValue || 0}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          minOrderValue: Number(e.target.value),
                        }))
                      }
                    />
                  </label>
                  <label className="block">
                    <span className="font-medium">Ngày bắt đầu</span>
                    <input
                      className="mt-1 w-full rounded border px-2 py-1"
                      placeholder="Chọn ngày bắt đầu"
                      type="datetime-local"
                      value={form.startDate}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, startDate: e.target.value }))
                      }
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="font-medium">Ngày kết thúc</span>
                    <input
                      className="mt-1 w-full rounded border px-2 py-1"
                      placeholder="Chọn ngày kết thúc"
                      type="datetime-local"
                      value={form.endDate}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, endDate: e.target.value }))
                      }
                      required
                    />
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
                    "&:hover": {
                      backgroundColor: "#eee",
                      color: "black",
                    },
                  }}
                  variant="text"
                />
                <h2 className="mb-4 text-lg font-semibold text-red-600">
                  Xác nhận xóa
                </h2>
                <p>
                  Bạn có chắc chắn muốn xóa mã <b>{showDelete.code}</b>?
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
                      "&:hover": {
                        backgroundColor: "white",
                        color: "red",
                      },
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
                      "&:hover": {
                        backgroundColor: "#eee",
                        color: "black",
                      },
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

export default AdminPromotions;
