import { redirect } from "next/navigation";

// Alias sesuai Bagian 3: /admin/agenda == /admin/kegiatan (pengelola Agenda publik).
// Dibuat sebagai redirect agar tidak ada duplikasi kode/pengelolaan.
export default function AdminAgendaAlias() {
  redirect("/admin/kegiatan");
}
