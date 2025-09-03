import { SortFilterItem } from "@/lib/constants";

export type ListItem = SortFilterItem | PathFilterItem;
export type PathFilterItem = { title: string; path: string };
