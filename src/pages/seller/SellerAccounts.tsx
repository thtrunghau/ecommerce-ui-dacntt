import React from "react";
import ErrorState from "../../components/common/ErrorState";

const SellerAccounts: React.FC = () => {
  // Seller không có quyền quản lý account, chỉ hiển thị thông báo hoặc redirect
  return <ErrorState message="Bạn không có quyền truy cập chức năng này." />;
};

export default SellerAccounts;
