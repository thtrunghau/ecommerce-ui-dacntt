import React from "react";
import useAuthStore from "../../store/authStore";
import ErrorState from "../../components/common/ErrorState";

const AdminAccounts: React.FC = () => {
  const { authorities } = useAuthStore();
  const isAdmin = authorities.includes("ROLE_ADMIN");

  if (!isAdmin) {
    return <ErrorState message="Bạn không có quyền truy cập trang này." />;
  }

  // ...render UI quản lý account (CRUD user, phân quyền, ...)
  return (
    <div className="mx-auto max-w-5xl px-2 py-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-gray-900">
        Quản lý tài khoản (Admin)
      </h1>
      {/* TODO: Table, form CRUD account, phân quyền, ... */}
      <div>Chức năng quản lý tài khoản chỉ dành cho Admin.</div>
    </div>
  );
};

export default AdminAccounts;
