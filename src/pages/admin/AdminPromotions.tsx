import React, { useState } from "react";
import RoundedButton from "../../components/common/RoundedButton";

// Giả lập danh sách sản phẩm để chọn áp dụng khuyến mãi
const mockProducts = [
  { id: "1", productName: "iPhone 15 Pro Max" },
  { id: "2", productName: "Samsung S24 Ultra" },
  { id: "3", productName: "MacBook Air M3" },
];

interface Promotion {
  id: string;
  promotionCode: string;
  promotionName: string;
  status: string;
  startDate: string;
  endDate: string;
  description: string;
  discountAmount: number;
  promotionType: string;
  proportionType: string;
  minOrderValue: number;
  productIds: string[];
}

// Giả lập dữ liệu khuyến mãi
const mockPromotions: Promotion[] = [
  {
    id: "P001",
    promotionCode: "SALE50",
    promotionName: "Giảm 50% toàn bộ",
    status: "Đang hoạt động",
    startDate: "2025-06-01",
    endDate: "2025-06-30",
    description: "Giảm giá 50% cho toàn bộ sản phẩm",
    discountAmount: 50,
    promotionType: "ALL_PRODUCTS",
    proportionType: "PERCENTAGE",
    minOrderValue: 0,
    productIds: [],
  },
  {
    id: "P002",
    promotionCode: "FREESHIP",
    promotionName: "Miễn phí vận chuyển",
    status: "Hết hạn",
    startDate: "2025-05-01",
    endDate: "2025-05-31",
    description: "Miễn phí vận chuyển cho đơn hàng từ 200.000đ",
    discountAmount: 0,
    promotionType: "ORDER_TOTAL",
    proportionType: "ABSOLUTE",
    minOrderValue: 200000,
    productIds: [],
  },
  {
    id: "P003",
    promotionCode: "NEWUSER",
    promotionName: "Ưu đãi khách mới",
    status: "Đang hoạt động",
    startDate: "2025-06-10",
    endDate: "2025-07-10",
    description: "Giảm 30% cho đơn hàng đầu tiên của khách hàng mới",
    discountAmount: 30,
    promotionType: "ALL_PRODUCTS",
    proportionType: "PERCENTAGE",
    minOrderValue: 0,
    productIds: [],
  },
];

const AdminPromotions: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>(mockPromotions);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editPromo, setEditPromo] = useState<Promotion | null>(null);
  const [form, setForm] = useState({
    promotionCode: "",
    promotionName: "",
    status: "Đang hoạt động",
    startDate: "",
    endDate: "",
    description: "",
    discountAmount: 0,
    promotionType: "ALL_PRODUCTS",
    proportionType: "PERCENTAGE",
    minOrderValue: 0,
    productIds: [] as string[],
  });
  const [showDelete, setShowDelete] = useState<{
    id: string;
    code: string;
  } | null>(null);

  const filtered = promotions.filter(
    (p) =>
      p.promotionCode.toLowerCase().includes(search.toLowerCase()) ||
      p.promotionName.toLowerCase().includes(search.toLowerCase()),
  );

  const handleOpenForm = (promo?: Promotion) => {
    setEditPromo(promo || null);
    setForm(
      promo
        ? { ...promo }
        : {
            promotionCode: "",
            promotionName: "",
            status: "Đang hoạt động",
            startDate: "",
            endDate: "",
            description: "",
            discountAmount: 0,
            promotionType: "ALL_PRODUCTS",
            proportionType: "PERCENTAGE",
            minOrderValue: 0,
            productIds: [] as string[],
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
      status: "Đang hoạt động",
      startDate: "",
      endDate: "",
      description: "",
      discountAmount: 0,
      promotionType: "ALL_PRODUCTS",
      proportionType: "PERCENTAGE",
      minOrderValue: 0,
      productIds: [] as string[],
    });
  };
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editPromo) {
      setPromotions((list) =>
        list.map((p) =>
          p.id === editPromo.id ? { ...editPromo, ...form } : p,
        ),
      );
    } else {
      setPromotions((list) => [
        ...list,
        { ...form, id: Date.now().toString() },
      ]);
    }
    handleCloseForm();
  };
  const handleDelete = (id: string) => {
    setPromotions((list) => list.filter((p) => p.id !== id));
    setShowDelete(null);
  };

  return (
    <div className="mx-auto max-w-5xl px-2 py-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-gray-900">
        Quản lý khuyến mãi
      </h1>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          className="w-full rounded-full border border-gray-300 bg-white px-5 py-2 text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-black focus:ring-2 focus:ring-black/20 sm:w-80"
          placeholder="Tìm kiếm mã hoặc tên khuyến mãi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
            {filtered.map((p) => (
              <tr
                key={p.id}
                className="border-t text-base transition hover:bg-gray-50"
              >
                <td className="py-2">{p.promotionCode}</td>
                <td className="py-2">{p.promotionName}</td>
                <td className="py-2">{p.status}</td>
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
                      "&:hover": { backgroundColor: "black", color: "white" },
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
                    setForm((f) => ({ ...f, promotionCode: e.target.value }))
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
                    setForm((f) => ({ ...f, promotionName: e.target.value }))
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
                <span className="font-medium">Số tiền giảm/Phần trăm giảm</span>
                <input
                  className="mt-1 w-full rounded border px-2 py-1"
                  placeholder="Nhập số tiền hoặc phần trăm giảm"
                  type="number"
                  min={0}
                  value={form.discountAmount}
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
                    setForm((f) => ({ ...f, promotionType: e.target.value }))
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
                    value={form.productIds}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions).map(
                        (opt) => opt.value,
                      );
                      setForm((f) => ({ ...f, productIds: selected }));
                    }}
                  >
                    {mockProducts.map((prod) => (
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
                    setForm((f) => ({ ...f, proportionType: e.target.value }))
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
                  value={form.minOrderValue}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      minOrderValue: Number(e.target.value),
                    }))
                  }
                />
              </label>
              <label className="block">
                <span className="font-medium">Trạng thái</span>
                <select
                  className="mt-1 w-full rounded border px-2 py-1"
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, status: e.target.value }))
                  }
                >
                  <option value="Đang hoạt động">Đang hoạt động</option>
                  <option value="Hết hạn">Hết hạn</option>
                </select>
              </label>
              <label className="block">
                <span className="font-medium">Ngày bắt đầu</span>
                <input
                  className="mt-1 w-full rounded border px-2 py-1"
                  placeholder="Chọn ngày bắt đầu"
                  type="date"
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
                  type="date"
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
    </div>
  );
};

export default AdminPromotions;
