export interface NavItemType {
  id: number;
  name: string;
  path: string;
  key: string;
  color: string;
  fontSize: string;
}

export const NAV_ITEMS: NavItemType[] = [
  {
    id: 1,
    name: "Ưu Đãi",
    path: "/uu-dai",
    key: "uu-dai",
    color: "#7A7A7A",
    fontSize: "12px",
  },
  {
    id: 2,
    name: "Di động",
    path: "/di-dong",
    key: "di-dong",
    color: "#7B7B7B",
    fontSize: "12.2px",
  },
  {
    id: 3,
    name: "TV & AV",
    path: "/tv-av",
    key: "tv-av",
    color: "#838382",
    fontSize: "12.5px",
  },
  {
    id: 4,
    name: "Gia Dụng",
    path: "/gia-dung",
    key: "gia-dung",
    color: "#80807F",
    fontSize: "12px",
  },
  {
    id: 5,
    name: "IT",
    path: "/it",
    key: "it",
    color: "#8E8B89",
    fontSize: "13.2px",
  },
  {
    id: 6,
    name: "Phụ kiện",
    path: "/phu-kien",
    key: "phu-kien",
    color: "#838383",
    fontSize: "12.3px",
  },
  {
    id: 7,
    name: "SmartThings",
    path: "/smartthings",
    key: "smartthings",
    color: "#888988",
    fontSize: "12.2px",
  },
  {
    id: 8,
    name: "AI",
    path: "/ai",
    key: "ai",
    color: "#908F8E",
    fontSize: "13.5px",
  },
] as const;
