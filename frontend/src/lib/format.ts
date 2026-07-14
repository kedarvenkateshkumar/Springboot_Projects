export const formatCurrency = (v: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(v);

export const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" }) : "—";
