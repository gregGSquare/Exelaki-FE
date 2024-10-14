export interface Category {
  _id: string;
  name: string;
  type: "IN" | "OUT";
  user: string | null;
}
