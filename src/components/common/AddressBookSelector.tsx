import React, { useState } from "react";
import type { AddressResDto } from "../../types/api";

interface AddressBookSelectorProps {
  addresses: AddressResDto[];
  onSelect: (addr: AddressResDto) => void;
  onAdd: (addr: Omit<AddressResDto, "id">) => void; // Khi thêm mới không có id
  onEdit: (addr: AddressResDto) => void;
  onDelete: (id: string) => void;
  selectedId?: string;
}

const AddressBookSelector: React.FC<AddressBookSelectorProps> = ({
  addresses,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
  selectedId,
}) => {
  // State for add/edit modal (simple, can be expanded later)
  const [showForm, setShowForm] = useState(false);
  const [editAddr, setEditAddr] = useState<AddressResDto | null>(null);
  const [form, setForm] = useState<Partial<AddressResDto>>({});

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editAddr) {
      onEdit({ ...editAddr, ...form } as AddressResDto);
    } else {
      // Không destructure id, chỉ truyền toàn bộ form
      const rest = form;
      onAdd(rest as Omit<AddressResDto, "id">);
    }
    setShowForm(false);
    setEditAddr(null);
    setForm({});
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Chọn địa chỉ giao hàng</h2>
        <button
          onClick={() => {
            setShowForm(true);
            setEditAddr(null);
            setForm({});
          }}
          className="rounded-full border bg-black px-4 py-2 font-semibold text-white transition hover:bg-white hover:text-black hover:shadow-lg"
        >
          Thêm địa chỉ mới
        </button>
      </div>
      {showForm && (
        <form
          onSubmit={handleFormSubmit}
          className="mb-4 space-y-2 rounded-lg border bg-gray-50 p-4"
        >
          <input
            className="w-full rounded border px-2 py-1"
            placeholder="Tên tòa nhà/Số nhà"
            value={form.buildingName || ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, buildingName: e.target.value }))
            }
            required
          />
          <input
            className="w-full rounded border px-2 py-1"
            placeholder="Đường"
            value={form.street || ""}
            onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))}
            required
          />
          <input
            className="w-full rounded border px-2 py-1"
            placeholder="Thành phố"
            value={form.city || ""}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            required
          />
          <input
            className="w-full rounded border px-2 py-1"
            placeholder="Tỉnh/Thành"
            value={form.state || ""}
            onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
            required
          />
          <input
            className="w-full rounded border px-2 py-1"
            placeholder="Quốc gia"
            value={form.country || ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, country: e.target.value }))
            }
            required
          />
          <input
            className="w-full rounded border px-2 py-1"
            placeholder="Mã bưu điện"
            value={form.pincode || ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, pincode: e.target.value }))
            }
            required
          />
          <div className="mt-2 flex gap-2">
            <button
              type="submit"
              className="rounded-full border bg-black px-4 py-2 font-semibold text-white transition hover:bg-white hover:text-black hover:shadow-lg"
            >
              Lưu
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditAddr(null);
                setForm({});
              }}
              className="rounded-full border px-4 py-2"
            >
              Hủy
            </button>
          </div>
        </form>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`group relative rounded-lg border bg-white p-4 shadow-sm ${selectedId === addr.id ? "ring-2 ring-black" : ""}`}
          >
            <div className="mb-1 font-medium text-gray-900">
              {addr.buildingName}, {addr.street}
            </div>
            <div className="mb-1 text-sm text-gray-700">
              {addr.city}, {addr.state}, {addr.country}
            </div>
            <div className="mb-2 text-xs text-gray-500">
              Mã bưu điện: {addr.pincode}
            </div>
            <div className="absolute right-2 top-2 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={() => {
                  setEditAddr(addr);
                  setForm(addr);
                  setShowForm(true);
                }}
                className="rounded-full border px-2 py-1 text-xs transition hover:bg-black hover:text-white"
              >
                Sửa
              </button>
              <button
                onClick={() => onDelete(addr.id)}
                className="rounded-full border px-2 py-1 text-xs transition hover:bg-red-600 hover:text-white"
              >
                Xóa
              </button>
            </div>
            <button
              onClick={() => onSelect(addr)}
              className="mt-2 w-full rounded-full border px-2 py-1 text-xs font-semibold transition hover:bg-black hover:text-white"
            >
              {selectedId === addr.id ? "Đang chọn" : "Chọn địa chỉ này"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddressBookSelector;
