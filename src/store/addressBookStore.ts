import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AddressResDto } from "../types/api";

interface AddressBookState {
  addresses: AddressResDto[];
  setAddresses: (addrs: AddressResDto[]) => void;
  addAddress: (addr: AddressResDto) => void;
  editAddress: (addr: AddressResDto) => void;
  deleteAddress: (id: string) => void;
  resetAddresses: () => void; // Thêm resetAddresses vào đây
}

export const useAddressBookStore = create<AddressBookState>()(
  persist(
    (set, get) => ({
      addresses: [], // Bỏ mockAddresses, khởi tạo rỗng
      setAddresses: (addrs) => set({ addresses: addrs }),
      addAddress: (addr) => set({ addresses: [...get().addresses, addr] }),
      editAddress: (addr) =>
        set({
          addresses: get().addresses.map((a) => (a.id === addr.id ? addr : a)),
        }),
      deleteAddress: (id) =>
        set({ addresses: get().addresses.filter((a) => a.id !== id) }),
      // Hàm reset toàn bộ address khi user đổi hoặc logout
      resetAddresses: () => set({ addresses: [] }),
    }),
    {
      name: "address-book-storage",
    },
  ),
);
