import React, { useState, useEffect } from "react";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorState from "../components/common/ErrorState";
import { useAddressBookStore } from "../store/addressBookStore";
import type { AddressResDto } from "../types/api";
import type { AccountResponseDTO } from "../types/api";
import useAuthStore from "../store/authStore";
import { api } from "../services/apiService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

// AddressForm: refactor dùng AddressResDto thay any
interface AddressFormProps {
  initial?: Partial<AddressResDto>;
  onSave: (addr: AddressResDto) => void;
  onCancel: () => void;
}
const AddressForm: React.FC<AddressFormProps> = ({
  initial,
  onSave,
  onCancel,
}) => {
  const authUser = useAuthStore((s) => s.user); // Lấy user hiện tại
  const [form, setForm] = useState<AddressResDto>({
    id: initial?.id || "",
    buildingName: initial?.buildingName || "",
    street: initial?.street || "",
    city: initial?.city || "",
    state: initial?.state || "",
    country: initial?.country || "",
    pincode: initial?.pincode || "",
    accountId: initial?.accountId || authUser?.id || "", // Đảm bảo luôn là string
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
  const authUser = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const navigate = useNavigate();
  const [user, setUser] = useState<AccountResponseDTO>(
    authUser as AccountResponseDTO,
  );
  const addresses = useAddressBookStore((s) => s.addresses);
  const editAddress = useAddressBookStore((s) => s.editAddress);
  const deleteAddress = useAddressBookStore((s) => s.deleteAddress);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editAddr, setEditAddr] = useState<AddressResDto | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [userForm, setUserForm] = useState({
    username: user.username || "",
    email: user.email || "",
    phoneNumber: user.phoneNumber || "",
    birthYear: user.birthYear || 2000,
  });
  const [userFormError, setUserFormError] = useState<string | null>(null);
  // State cho đổi mật khẩu
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleAdd = () => {
    setEditAddr(null);
    setShowForm(true);
  };
  const handleEdit = (addr: AddressResDto) => {
    setEditAddr(addr);
    setShowForm(true);
  };
  const handleDelete = (id: string) => {
    deleteAddress(id);
  };
  const handleSave = async (addr: AddressResDto) => {
    if (editAddr) {
      editAddress({ ...editAddr, ...addr });
    } else {
      try {
        // Gọi API tạo địa chỉ mới
        await api.address.create({
          ...addr,
          accountId: user.id,
        });
        // Sau khi tạo thành công, fetch lại danh sách địa chỉ từ BE
        const addressesFromBE = await api.address.getByAccountId(user.id);
        useAddressBookStore.getState().setAddresses(addressesFromBE);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        toast.error("Không thể thêm địa chỉ mới. Vui lòng thử lại!");
      }
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
  // Khi lưu form user, gọi updateUser để cập nhật store và đồng bộ backend
  const handleUserFormSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormError(null);
    try {
      if (!user.id) throw new Error("Thiếu ID user");
      // Gửi API cập nhật backend
      await api.account.update(user.id, {
        ...user,
        ...userForm,
      });
      // Cập nhật store zustand
      updateUser(userForm);
      setUser((prev) => ({ ...prev, ...userForm }));
      toast.success("Cập nhật thông tin thành công!");
    } catch (err) {
      setUserFormError(
        (err as Error).message || "Có lỗi khi cập nhật thông tin",
      );
      toast.error((err as Error).message || "Có lỗi khi cập nhật thông tin");
    }
  };
  // Đổi mật khẩu
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      setPasswordError("Mật khẩu mới phải từ 6 ký tự trở lên");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Mật khẩu xác nhận không khớp");
      return;
    }
    setPasswordLoading(true);
    try {
      await api.account.update(user.id, {
        ...user,
        password: passwordForm.newPassword,
      });
      toast.success("Đổi mật khẩu thành công!");
      setShowPasswordForm(false);
      setPasswordForm({ newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPasswordError((err as Error).message || "Có lỗi khi đổi mật khẩu");
      toast.error((err as Error).message || "Có lỗi khi đổi mật khẩu");
    } finally {
      setPasswordLoading(false);
    }
  };

  useEffect(() => {
    if (authUser) {
      setUser(authUser);
      setUserForm({
        username: authUser.username || "",
        email: authUser.email || "",
        phoneNumber: authUser.phoneNumber || "",
        birthYear: authUser.birthYear || 2000,
      });
    }
  }, [authUser]);

  useEffect(() => {
    if (!authUser) {
      navigate("/", { replace: true });
    }
  }, [authUser, navigate]);

  if (loading) return <LoadingSpinner className="min-h-screen" />;
  if (error) return <ErrorState message={error} className="min-h-screen" />;

  return (
    <div className="container mx-auto px-2 py-8 md:px-4">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">
        Thông tin tài khoản
      </h1>
      {/* Section: Thông tin cá nhân */}
      <div className="mb-8 flex flex-col items-center gap-6 rounded-xl border border-gray-100 bg-white p-6 shadow md:flex-row">
        <div className="flex h-24 w-24 items-center justify-center rounded-full border bg-gray-100 text-5xl text-gray-400">
          <i className="fa-regular fa-user"></i>
        </div>
        <div className="flex-1 space-y-2">
          {isEditing ? (
            <form
              className="space-y-2"
              onSubmit={(e) => {
                e.preventDefault();
                handleUserFormSave(e);
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
                SĐT: {user.phoneNumber || "Chưa cập nhật"}
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
      {/* Section: Đổi mật khẩu */}
      <div className="mb-8 rounded-xl border border-gray-100 bg-white p-6 shadow">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Đổi mật khẩu</h2>
          <button
            onClick={() => setShowPasswordForm((v) => !v)}
            className="rounded-full border px-4 py-2 text-sm transition hover:bg-black hover:text-white"
          >
            {showPasswordForm ? "Đóng" : "Đổi mật khẩu"}
          </button>
        </div>
        {showPasswordForm && (
          <form className="max-w-md space-y-2" onSubmit={handlePasswordChange}>
            <input
              className="w-full rounded border px-2 py-1"
              type="password"
              placeholder="Mật khẩu mới"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))
              }
              required
            />
            <input
              className="w-full rounded border px-2 py-1"
              type="password"
              placeholder="Xác nhận mật khẩu mới"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm((f) => ({
                  ...f,
                  confirmPassword: e.target.value,
                }))
              }
              required
            />
            {passwordError && (
              <div className="text-sm text-red-500">{passwordError}</div>
            )}
            <div className="mt-2 flex gap-2">
              <button
                type="submit"
                className="rounded-full bg-black px-4 py-2 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-black hover:shadow-lg active:scale-95"
                disabled={passwordLoading}
              >
                {passwordLoading ? "Đang lưu..." : "Lưu"}
              </button>
              <button
                type="button"
                onClick={() => setShowPasswordForm(false)}
                className="rounded-full border px-4 py-2"
                disabled={passwordLoading}
              >
                Hủy
              </button>
            </div>
          </form>
        )}
      </div>
      {/* Section: Sổ địa chỉ */}
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
          <div className="py-8 text-center text-gray-500">
            Hiện tại chưa có địa chỉ nào
          </div>
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
                <div className="mb-1 text-sm text-gray-700">
                  Mã bưu điện: {addr.pincode}
                </div>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => handleEdit(addr)}
                    className="rounded-full border px-3 py-1 text-xs transition hover:bg-black hover:text-white"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="rounded-full border px-3 py-1 text-xs text-red-600 transition hover:bg-red-600 hover:text-white"
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
