/** Alasan laporan map — dipakai di dialog laporan dan halaman admin. */
export const reportReasons = [
  { id: "WRONG_URL", label: "Link atau game salah" },
  { id: "SCAM", label: "Phishing / penipuan" },
  { id: "INAPPROPRIATE", label: "Konten tidak pantas" },
  { id: "DUPLICATE", label: "Duplikat map lain" },
  { id: "OTHER", label: "Lainnya" },
] as const;

export function reportReasonLabel(reason: string) {
  return reportReasons.find((item) => item.id === reason)?.label ?? reason;
}
