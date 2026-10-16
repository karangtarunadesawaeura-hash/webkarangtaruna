import Image from "next/image";
import { Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { BoardMember } from "@/types/database";

/**
 * Bagan Struktur Kepengurusan — murni berbasis urutan tabel `board_members`
 * (`sort_order` terkecil = puncak). Aturan tingkat:
 *  - Tingkat 1 (puncak): urutan pertama — umumnya Ketua.
 *  - Tingkat 2 (inti): 3 urutan berikutnya — umumnya Wakil, Sekretaris, Bendahara.
 *  - Tingkat 3 (bidang): sisanya, dikelompokkan per kolom `division`/bidang.
 * Nonaktif (`is_active = false`) tidak diteruskan ke komponen ini (difilter di query).
 */
function Node({ m, large = false }: { m: BoardMember; large?: boolean }) {
  return (
    <div
      className={`flex flex-col items-center gap-2 rounded-2xl border border-forest-100 bg-white text-center shadow-sm ${
        large ? "w-52 p-5" : "w-40 p-4"
      }`}
    >
      <span
        className={`relative shrink-0 overflow-hidden rounded-full bg-forest-100 ${
          large ? "h-20 w-20" : "h-14 w-14"
        }`}
      >
        {m.photo_url ? (
          <Image src={m.photo_url} alt={`Foto ${m.name}`} fill sizes="80px" className="object-cover" loading="lazy" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-forest-700">
            <Users className={large ? "h-8 w-8" : "h-6 w-6"} />
          </span>
        )}
      </span>
      <div className="min-w-0">
        <p className={`font-bold leading-tight ${large ? "text-base" : "text-sm"}`}>{m.name}</p>
        <p className="text-xs font-semibold text-forest-700">{m.position}</p>
        {m.division && <p className="mt-0.5 text-[11px] text-stone-500">{m.division}</p>}
      </div>
    </div>
  );
}

export function OrgChart({ members }: { members: BoardMember[] }) {
  if (members.length === 0) return null;
  const [top, ...rest] = members;
  const core = rest.slice(0, 3);
  const fieldMembers = rest.slice(3);

  const groups = new Map<string, BoardMember[]>();
  for (const m of fieldMembers) {
    const key = (m.division ?? "").trim() || "Pengurus";
    const list = groups.get(key) ?? [];
    list.push(m);
    groups.set(key, list);
  }

  return (
    <div className="flex flex-col items-center">
      <Node m={top} large />
      {core.length > 0 && (
        <>
          <span aria-hidden="true" className="h-6 w-px bg-forest-200" />
          <div className="flex flex-wrap items-start justify-center gap-4">
            {core.map((m) => (
              <Node key={m.id} m={m} />
            ))}
          </div>
        </>
      )}
      {groups.size > 0 && (
        <>
          <span aria-hidden="true" className="h-6 w-px bg-forest-200" />
          <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...groups.entries()].map(([division, list]) => (
              <Card key={division}>
                <CardContent className="flex flex-col items-center gap-3 p-5">
                  <h3 className="rounded-full bg-forest-900 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-gold-400">
                    {division}
                  </h3>
                  <ul className="flex w-full flex-col gap-2">
                    {list.map((m) => (
                      <li key={m.id} className="flex items-center gap-3 rounded-xl bg-forest-50/60 p-2.5">
                        <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-forest-100">
                          {m.photo_url ? (
                            <Image src={m.photo_url} alt={`Foto ${m.name}`} fill sizes="40px" className="object-cover" loading="lazy" />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-forest-700">
                              <Users className="h-4 w-4" />
                            </span>
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-bold">{m.name}</span>
                          <span className="block truncate text-xs text-forest-700">{m.position}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
