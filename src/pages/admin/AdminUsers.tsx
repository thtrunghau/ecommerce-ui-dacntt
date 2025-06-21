import React, { useState, useEffect } from "react";
import RoundedButton from "../../components/common/RoundedButton";
import { api } from "../../services/apiService";
import type { GroupResponseDTO, AccountResponseDTO } from "../../types/api";
import toast, { Toaster } from "react-hot-toast";
import AdminUserRowSkeleton from "../../components/common/AdminUserRowSkeleton";
import useAuthStore from "../../store/authStore";

interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  birthYear: number;
  phoneNumber: string;
  role: string;
  status: string;
  groupId?: string;
  groupName?: string; // Thêm groupName để hiển thị
}

const AdminUsers: React.FC = () => {
  const { authorities } = useAuthStore();
  const isAdmin =
    authorities.includes("admin") || authorities.includes("ROLE_ADMIN");

  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    birthYear: 2000,
    phoneNumber: "",
    role: "USER",
    status: "Hoạt động",
    groupId: "",
  });
  const [showLock, setShowLock] = useState<{
    id: string;
    username: string;
  } | null>(null);
  const [showDelete, setShowDelete] = useState<{
    id: string;
    username: string;
  } | null>(null);
  const [groups, setGroups] = useState<GroupResponseDTO[]>([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);
  const [groupLoading, setGroupLoading] = useState(false);
  const [groupError, setGroupError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const filtered = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  const handleOpenForm = (user?: User) => {
    setEditUser(user || null);
    setForm(
      user
        ? { ...user, groupId: user.groupId || "" }
        : {
            username: "",
            email: "",
            password: "",
            birthYear: 2000,
            phoneNumber: "",
            role: "USER",
            status: "Hoạt động",
            groupId: "",
          },
    );
    setShowForm(true);
  };
  const handleCloseForm = () => {
    setShowForm(false);
    setEditUser(null);
    setForm({
      username: "",
      email: "",
      password: "",
      birthYear: 2000,
      phoneNumber: "",
      role: "USER",
      status: "Hoạt động",
      groupId: "",
    });
  };
  // Helper: map AccountResponseDTO về User
  const mapAccountToUser = (
    u: AccountResponseDTO,
    groups: GroupResponseDTO[],
  ): User => {
    // Type guard kiểm tra group object
    function hasGroupObject(
      account: AccountResponseDTO,
    ): account is AccountResponseDTO & { group: { id: string } } {
      return (
        !!account.group &&
        typeof account.group === "object" &&
        typeof account.group.id === "string"
      );
    }
    let groupId = "";
    if (hasGroupObject(u)) {
      groupId = u.group.id;
    } else if (typeof u.groupId === "string") {
      groupId = u.groupId;
    }
    const groupName = groups.find((g) => g.id === groupId)?.name || "USER";
    return {
      id: u.id,
      username: u.username || "",
      email: u.email || "",
      password: "",
      birthYear: u.birthYear || 2000,
      phoneNumber: u.phoneNumber || "",
      role: groupName.toUpperCase(),
      status: "Hoạt động",
      groupId,
      groupName,
    };
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError(null);
    try {
      if (editUser) {
        // Gọi API update user
        const payload = {
          username: form.username,
          email: form.email,
          password: form.password || undefined, // Không đổi nếu rỗng
          birthYear: form.birthYear,
          phoneNumber: form.phoneNumber,
          groupId: form.groupId || undefined,
        };
        await api.account.update(editUser.id, payload);
        toast.success("Cập nhật user thành công!");
      } else {
        const payload = {
          username: form.username,
          email: form.email,
          password: form.password,
          birthYear: form.birthYear,
          phoneNumber: form.phoneNumber,
          groupId: form.groupId || undefined,
        };
        await api.account.create(payload);
        toast.success("Thêm user thành công!");
      }
      // Reload lại danh sách user sau khi thêm/sửa
      setUserLoading(true);
      api.account
        .getList()
        .then((res) => {
          setUsers(
            (res.data || []).map((u: AccountResponseDTO) =>
              mapAccountToUser(u, groups),
            ),
          );
          setUserLoading(false);
        })
        .catch(() => {
          setUserError("Không lấy được danh sách user");
          setUserLoading(false);
        });
      handleCloseForm();
    } catch (err) {
      setSubmitError((err as Error).message || "Có lỗi xảy ra khi lưu user");
      toast.error((err as Error).message || "Có lỗi xảy ra khi lưu user");
    } finally {
      setSubmitLoading(false);
    }
  };
  const handleLock = (id: string) => {
    setUsers((list) =>
      list.map((u) =>
        u.id === id
          ? { ...u, status: u.status === "Hoạt động" ? "Khóa" : "Hoạt động" }
          : u,
      ),
    );
    setShowLock(null);
  };
  const handleDelete = async (id: string) => {
    try {
      await api.account.delete(id);
      setUsers((list) => list.filter((u) => u.id !== id));
      setShowDelete(null);
      toast.success("Xóa user thành công!");
    } catch {
      toast.error("Xóa user thất bại!");
    }
  };

  // Load group và user đồng bộ, tránh race condition
  useEffect(() => {
    setGroupLoading(true);
    setUserLoading(true);
    setGroupError(null);
    setUserError(null);
    api.group
      .getList()
      .then((groupRes) => {
        const groupList = groupRes.data || [];
        setGroups(groupList);
        setGroupLoading(false);
        // Sau khi có group, load user
        api.account
          .getList()
          .then((userRes) => {
            setUsers(
              (userRes.data || []).map((u: AccountResponseDTO) =>
                mapAccountToUser(u, groupList),
              ),
            );
            setUserLoading(false);
          })
          .catch(() => {
            setUserError("Không lấy được danh sách user");
            setUserLoading(false);
          });
      })
      .catch(() => {
        setGroupError("Không lấy được danh sách nhóm quyền");
        setGroupLoading(false);
        setUserLoading(false);
      });
  }, []);

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center text-xl font-semibold text-red-600">
        Bạn không có quyền truy cập trang này.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-2 py-8">
      <Toaster position="top-right" />
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-gray-900">
        Quản lý người dùng
      </h1>
      {userLoading || groupLoading ? (
        <div className="overflow-x-auto rounded-2xl bg-white p-6 shadow-lg">
          <table className="w-full text-left">
            <thead>
              <tr className="text-base text-gray-500">
                <th className="py-2">Tên đăng nhập</th>
                <th className="py-2">Email</th>
                <th className="py-2">Nhóm quyền</th>
                <th className="py-2">Trạng thái</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, i) => (
                <AdminUserRowSkeleton key={i} />
              ))}
            </tbody>
          </table>
        </div>
      ) : userError ? (
        <div className="text-red-500">{userError}</div>
      ) : (
        <>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <input
              className="w-full rounded-full border border-gray-300 bg-white px-5 py-2 text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-black focus:ring-2 focus:ring-black/20 sm:w-80"
              placeholder="Tìm kiếm tên, email hoặc nhóm quyền..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              onClick={() => handleOpenForm()}
              className="rounded-full bg-black px-6 py-2 font-semibold text-white shadow transition hover:border hover:border-black hover:bg-white hover:text-black"
            >
              Thêm user
            </button>
          </div>
          <div className="overflow-x-auto rounded-2xl bg-white p-6 shadow-lg">
            <table className="w-full text-left">
              <thead>
                <tr className="text-base text-gray-500">
                  <th className="py-2">Tên đăng nhập</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Nhóm quyền</th>
                  <th className="py-2">Trạng thái</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr
                    key={u.id}
                    className="border-t text-base transition hover:bg-gray-50"
                  >
                    <td className="py-2">{u.username}</td>
                    <td className="py-2">{u.email}</td>
                    <td className="py-2">{u.groupName}</td>
                    <td className="py-2">{u.status}</td>
                    <td className="py-2">
                      <RoundedButton
                        text="Sửa"
                        onClick={() => handleOpenForm(u)}
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
                        text={u.status === "Hoạt động" ? "Khóa" : "Mở khóa"}
                        onClick={() =>
                          setShowLock({ id: u.id, username: u.username })
                        }
                        size="small"
                        sx={{
                          minWidth: 0,
                          fontWeight: 500,
                          fontSize: "0.75rem",
                          padding: "2px 12px",
                          backgroundColor: "white",
                          color: u.status === "Hoạt động" ? "red" : "green",
                          border: `1px solid ${u.status === "Hoạt động" ? "red" : "green"}`,
                          "&:hover": {
                            backgroundColor:
                              u.status === "Hoạt động" ? "red" : "green",
                            color: "white",
                          },
                        }}
                        variant="contained"
                      />
                      <RoundedButton
                        text="Xóa"
                        onClick={() =>
                          setShowDelete({ id: u.id, username: u.username })
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
          {/* Form thêm/sửa user */}
          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <form
                onSubmit={handleSave}
                className="mx-2 grid max-h-screen w-full max-w-3xl grid-cols-1 gap-2 overflow-y-auto rounded-xl bg-white p-2 shadow-xl sm:mx-auto sm:gap-4 sm:p-6 md:grid-cols-2"
              >
                <h2 className="col-span-1 mb-4 text-lg font-semibold md:col-span-2">
                  {editUser ? "Sửa user" : "Thêm user"}
                </h2>
                <div className="space-y-3">
                  <label className="block">
                    <span className="font-medium">Tên đăng nhập</span>
                    <input
                      className="mt-1 w-full rounded border px-2 py-1"
                      placeholder="Nhập tên đăng nhập"
                      value={form.username}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, username: e.target.value }))
                      }
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="font-medium">Email</span>
                    <input
                      className="mt-1 w-full rounded border px-2 py-1"
                      placeholder="Nhập email"
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, email: e.target.value }))
                      }
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="font-medium">Mật khẩu</span>
                    <input
                      className="mt-1 w-full rounded border px-2 py-1"
                      placeholder="Nhập mật khẩu"
                      type="password"
                      value={form.password}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, password: e.target.value }))
                      }
                      required={!editUser}
                    />
                  </label>
                  <label className="block">
                    <span className="font-medium">Năm sinh</span>
                    <input
                      className="mt-1 w-full rounded border px-2 py-1"
                      placeholder="Nhập năm sinh"
                      type="number"
                      min={1900}
                      max={new Date().getFullYear()}
                      value={form.birthYear}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          birthYear: Number(e.target.value),
                        }))
                      }
                    />
                  </label>
                  <label className="block">
                    <span className="font-medium">Số điện thoại</span>
                    <input
                      className="mt-1 w-full rounded border px-2 py-1"
                      placeholder="Nhập số điện thoại"
                      value={form.phoneNumber}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, phoneNumber: e.target.value }))
                      }
                    />
                  </label>
                </div>
                <div className="space-y-3">
                  <label className="block">
                    <span className="font-medium">Vai trò</span>
                    <select
                      className="mt-1 w-full rounded border px-2 py-1"
                      value={form.role}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, role: e.target.value }))
                      }
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="font-medium">Trạng thái tài khoản</span>
                    <select
                      className="mt-1 w-full rounded border px-2 py-1"
                      value={form.status}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, status: e.target.value }))
                      }
                    >
                      <option value="Hoạt động">Hoạt động</option>
                      <option value="Khóa">Khóa</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="font-medium">Nhóm quyền (Group)</span>
                    {groupLoading ? (
                      <div>Đang tải...</div>
                    ) : groupError ? (
                      <div className="text-red-500">{groupError}</div>
                    ) : (
                      <select
                        className="mt-1 w-full rounded border px-2 py-1"
                        value={form.groupId || ""}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, groupId: e.target.value }))
                        }
                        required
                      >
                        <option value="">Chọn nhóm quyền...</option>
                        {groups.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </label>
                </div>
                {submitError && (
                  <div className="col-span-2 mb-2 font-medium text-red-600">
                    {submitError}
                  </div>
                )}
                <div className="col-span-1 mt-4 flex gap-2 md:col-span-2">
                  <RoundedButton
                    text={submitLoading ? "Đang lưu..." : "Lưu"}
                    type="submit"
                    sx={{ minWidth: 0, fontWeight: 600 }}
                    disabled={submitLoading}
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
                    disabled={submitLoading}
                  />
                </div>
              </form>
            </div>
          )}
          {/* Xác nhận khóa/mở khóa */}
          {showLock && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
                <RoundedButton
                  text="×"
                  type="button"
                  onClick={() => setShowLock(null)}
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
                  Xác nhận
                </h2>
                <p>
                  Bạn có chắc chắn muốn{" "}
                  {users.find((u) => u.id === showLock.id)?.status ===
                  "Hoạt động"
                    ? "khóa"
                    : "mở khóa"}{" "}
                  user <b>{showLock.username}</b>?
                </p>
                <div className="mt-4 flex gap-2">
                  <RoundedButton
                    text={
                      users.find((u) => u.id === showLock.id)?.status ===
                      "Hoạt động"
                        ? "Khóa"
                        : "Mở khóa"
                    }
                    onClick={() => handleLock(showLock.id)}
                    sx={{
                      minWidth: 0,
                      fontWeight: 600,
                      backgroundColor:
                        users.find((u) => u.id === showLock.id)?.status ===
                        "Hoạt động"
                          ? "red"
                          : "green",
                      color: "white",
                      border: `1px solid ${users.find((u) => u.id === showLock.id)?.status === "Hoạt động" ? "red" : "green"}`,
                      "&:hover": {
                        backgroundColor: "white",
                        color:
                          users.find((u) => u.id === showLock.id)?.status ===
                          "Hoạt động"
                            ? "red"
                            : "green",
                      },
                    }}
                    variant="contained"
                  />
                  <RoundedButton
                    text="Hủy"
                    onClick={() => setShowLock(null)}
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
          {/* Xác nhận xóa user */}
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
                  Bạn có chắc chắn muốn xóa user <b>{showDelete.username}</b>?
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

export default AdminUsers;
