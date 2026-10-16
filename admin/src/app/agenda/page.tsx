import { redirect } from "next/navigation";

// /agenda == /kegiatan (pengelola Agenda publik).
// Dibuat sebagai redirect agar tidak ada duplikasi kode/pengelolaan.
export default function AdminAgendaAlias() {
  redirect("/kegiatan");
}
