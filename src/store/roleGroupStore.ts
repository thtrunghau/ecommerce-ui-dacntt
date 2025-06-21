// src/store/roleGroupStore.ts
import { create } from "zustand";
import type { RoleGroup } from "../utils/roleHelpers";

interface RoleGroupState {
  roleGroups: RoleGroup[];
  setRoleGroups: (groups: RoleGroup[]) => void;
}

const useRoleGroupStore = create<RoleGroupState>((set) => ({
  roleGroups: [],
  setRoleGroups: (groups) => set({ roleGroups: groups }),
}));

export default useRoleGroupStore;
