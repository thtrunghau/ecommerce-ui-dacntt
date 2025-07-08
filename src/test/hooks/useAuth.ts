// import { useEffect } from "react";
// import { useAuth as useAuthContext } from "../contexts/AuthContext";

// export const useAuth = () => {
//   const auth = useAuthContext();

//   // Kiểm tra và khôi phục trạng thái đăng nhập từ localStorage khi tải trang
//   useEffect(() => {
//     const storedUser = localStorage.getItem("user");

//     if (storedUser && !auth.isAuthenticated) {
//       try {
//         const parsedUser = JSON.parse(storedUser);
//         auth.login(parsedUser);
//       } catch (error) {
//         console.error("Failed to parse stored user:", error);
//         localStorage.removeItem("user");
//       }
//     }
//   }, [auth]);

//   return auth;
// };

// export default useAuth;
