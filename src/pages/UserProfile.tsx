import React, { useState } from "react";
import { mockUser } from "../mockData/userProfileMock";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorState from "../components/common/ErrorState";
import { useAddressBookStore } from "../store/addressBookStore";
import type { AddressDto } from "../types/order";
import type { AccountResponseDTO } from "../types/api";

// AddressForm: refactor dùng AddressDto thay any
interface AddressFormProps {
  initial?: Partial<AddressDto>;
  onSave: (addr: AddressDto) => void;
  onCancel: () => void;
}
const AddressForm: React.FC<AddressFormProps> = ({
  initial,
  onSave,
  onCancel,
}) => {
  const [form, setForm] = useState<AddressDto>({
    id: initial?.id || "",
    buildingName: initial?.buildingName || "",
    street: initial?.street || "",
    city: initial?.city || "",
    state: initial?.state || "",
    country: initial?.country || "",
    pincode: initial?.pincode || "",
    accountId: initial?.accountId || null,
  });
  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
    >
      <input
        className="w-full rounded border px-2 py-1"
        placeholder="Tên tòa nhà/Số nhà"
        value={form.buildingName}
        onChange={(e) => setForm({ ...form, buildingName: e.target.value })}
        required
      />
      <input
        className="w-full rounded border px-2 py-1"
        placeholder="Đường"
        value={form.street}
        onChange={(e) => setForm({ ...form, street: e.target.value })}
        required
      />
      <input
        className="w-full rounded border px-2 py-1"
        placeholder="Thành phố"
        value={form.city}
        onChange={(e) => setForm({ ...form, city: e.target.value })}
        required
      />
      <input
        className="w-full rounded border px-2 py-1"
        placeholder="Tỉnh/Thành"
        value={form.state}
        onChange={(e) => setForm({ ...form, state: e.target.value })}
        required
      />
      <input
        className="w-full rounded border px-2 py-1"
        placeholder="Quốc gia"
        value={form.country}
        onChange={(e) => setForm({ ...form, country: e.target.value })}
        required
      />
      <input
        className="w-full rounded border px-2 py-1"
        placeholder="Mã bưu điện"
        value={form.pincode}
        onChange={(e) => setForm({ ...form, pincode: e.target.value })}
        required
      />
      <div className="mt-2 flex gap-2">
        <button
          type="submit"
          className="rounded-full bg-black px-4 py-2 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black hover:shadow-lg active:scale-95"
        >
          Lưu
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border px-4 py-2"
        >
          Hủy
        </button>
      </div>
    </form>
  );
};

// UserProfile: thêm form chỉnh sửa thông tin cá nhân
const UserProfile: React.FC = () => {
  const [user, setUser] = useState<AccountResponseDTO & { avatar: string }>({
    ...mockUser,
  });
  const addresses = useAddressBookStore((s) => s.addresses);
  const addAddress = useAddressBookStore((s) => s.addAddress);
  const editAddress = useAddressBookStore((s) => s.editAddress);
  const deleteAddress = useAddressBookStore((s) => s.deleteAddress);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editAddr, setEditAddr] = useState<AddressDto | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [userForm, setUserForm] = useState({
    username: user.username || "",
    email: user.email || "",
    phoneNumber: user.phoneNumber || "",
    birthYear: user.birthYear || 2000,
  });
  const [userFormError, setUserFormError] = useState<string | null>(null);

  const handleAdd = () => {
    setEditAddr(null);
    setShowForm(true);
  };
  const handleEdit = (addr: AddressDto) => {
    setEditAddr(addr);
    setShowForm(true);
  };
  const handleDelete = (id: string) => {
    deleteAddress(id);
  };
  const handleSave = (addr: AddressDto) => {
    if (editAddr) {
      editAddress({ ...editAddr, ...addr });
    } else {
      addAddress({ ...addr, id: `address-${Date.now()}`, accountId: user.id });
    }
    setShowForm(false);
    setEditAddr(null);
  };
  const handleUserEdit = () => {
    setIsEditing(true);
    setUserForm({
      username: user.username || "",
      email: user.email || "",
      phoneNumber: user.phoneNumber || "",
      birthYear: user.birthYear || 2000,
    });
    setUserFormError(null);
  };
  const handleUserCancel = () => {
    setIsEditing(false);
    setUserFormError(null);
  };
  const handleUserSave = () => {
    // Validate
    if (!userForm.username.trim()) {
      setUserFormError("Tên không được để trống");
      return;
    }
    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(userForm.email)) {
      setUserFormError("Email không hợp lệ");
      return;
    }
    if (!/^0\d{9}$/.test(userForm.phoneNumber)) {
      setUserFormError("Số điện thoại phải có 10 số, bắt đầu bằng 0");
      return;
    }
    if (
      userForm.birthYear < 1900 ||
      userForm.birthYear > new Date().getFullYear()
    ) {
      setUserFormError("Năm sinh không hợp lệ");
      return;
    }
    setUser({ ...user, ...userForm });
    setIsEditing(false);
    setUserFormError(null);
  };

  if (loading) return <LoadingSpinner className="min-h-screen" />;
  if (error) return <ErrorState message={error} className="min-h-screen" />;

  return (
    <div className="container mx-auto px-2 py-8 md:px-4">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">
        Thông tin tài khoản
      </h1>
      {/* Section: User Info */}
      <div className="mb-8 flex flex-col items-center gap-6 rounded-xl border border-gray-100 bg-white p-6 shadow md:flex-row">
        <img
          src={user.avatar}
          alt={user.username}
          className="h-24 w-24 rounded-full border object-cover"
        />
        <div className="flex-1 space-y-2">
          {isEditing ? (
            <form
              className="space-y-2"
              onSubmit={(e) => {
                e.preventDefault();
                handleUserSave();
              }}
            >
              <input
                className="w-full rounded border px-2 py-1"
                placeholder="Tên người dùng"
                value={userForm.username}
                onChange={(e) =>
                  setUserForm((f) => ({ ...f, username: e.target.value }))
                }
                required
              />
              <input
                className="w-full rounded border px-2 py-1"
                placeholder="Email"
                value={userForm.email}
                onChange={(e) =>
                  setUserForm((f) => ({ ...f, email: e.target.value }))
                }
                required
                type="email"
              />
              <input
                className="w-full rounded border px-2 py-1"
                placeholder="Số điện thoại"
                value={userForm.phoneNumber}
                onChange={(e) =>
                  setUserForm((f) => ({ ...f, phoneNumber: e.target.value }))
                }
                required
              />
              <input
                className="w-full rounded border px-2 py-1"
                placeholder="Năm sinh"
                value={userForm.birthYear}
                onChange={(e) =>
                  setUserForm((f) => ({
                    ...f,
                    birthYear: Number(e.target.value),
                  }))
                }
                required
                type="number"
                min="1900"
                max={new Date().getFullYear()}
              />
              {userFormError && (
                <div className="text-sm text-red-500">{userFormError}</div>
              )}
              <div className="mt-2 flex gap-2">
                <button
                  type="submit"
                  className="rounded-full bg-black px-4 py-2 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black hover:shadow-lg active:scale-95"
                >
                  Lưu
                </button>
                <button
                  type="button"
                  onClick={handleUserCancel}
                  className="rounded-full border px-4 py-2"
                >
                  Hủy
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="text-lg font-semibold text-gray-900">
                {user.username}
              </div>
              <div className="text-sm text-gray-600">Email: {user.email}</div>
              <div className="text-sm text-gray-600">
                SĐT: {user.phoneNumber}
              </div>
              <div className="text-sm text-gray-600">
                Năm sinh: {user.birthYear}
              </div>
              <button
                onClick={handleUserEdit}
                className="mt-2 rounded-full border px-4 py-2 text-sm transition hover:bg-black hover:text-white"
              >
                Chỉnh sửa
              </button>
            </>
          )}
        </div>
      </div>
      {/* Section: Address Book */}
      <div className="mb-8 rounded-xl border border-gray-100 bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Sổ địa chỉ</h2>
          <button
            onClick={handleAdd}
            className="rounded-full bg-black px-4 py-2 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black hover:shadow-lg active:scale-95"
          >
            Thêm địa chỉ
          </button>
        </div>
        {showForm && (
          <div className="mb-6">
            <AddressForm
              initial={editAddr || undefined}
              onSave={handleSave}
              onCancel={() => {
                setShowForm(false);
                setEditAddr(null);
              }}
            />
          </div>
        )}
        {addresses.length === 0 ? (
          <ErrorState message="Bạn chưa có địa chỉ nào." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="group relative rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm"
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
                    onClick={() => handleEdit(addr)}
                    className="rounded-full border px-2 py-1 text-xs transition hover:bg-black hover:text-white"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="rounded-full border px-2 py-1 text-xs transition hover:bg-red-600 hover:text-white"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
