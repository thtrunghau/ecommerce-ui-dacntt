import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AddressDto } from "../types/order";
import { mockAddresses } from "../mockData/userProfileMock";

interface AddressBookState {
  addresses: AddressDto[];
  setAddresses: (addrs: AddressDto[]) => void;
  addAddress: (addr: AddressDto) => void;
  editAddress: (addr: AddressDto) => void;
  deleteAddress: (id: string) => void;
}

export const useAddressBookStore = create<AddressBookState>()(
  persist(
    (set, get) => ({
      addresses: mockAddresses,
      setAddresses: (addrs) => set({ addresses: addrs }),
      addAddress: (addr) => set({ addresses: [...get().addresses, addr] }),
      editAddress: (addr) =>
        set({
          addresses: get().addresses.map((a) => (a.id === addr.id ? addr : a)),
        }),
      deleteAddress: (id) =>
        set({ addresses: get().addresses.filter((a) => a.id !== id) }),
    }),
    {
      name: "address-book-storage",
    },
  ),
);
