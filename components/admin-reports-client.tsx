"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Chip } from "@heroui/react";
import { EyeOff, ExternalLink, X } from "lucide-react";
import { resolveReportsAction } from "@/actions/maps";
import { useDialogs } from "@/components/dialog-provider";
import { reportReasonLabel } from "@/lib/report-reasons";
import { skeuoButton } from "@/lib/ui";

export type ReportGroup = {
  map: {
    id: string;
    name: string;
    slug: string;
    status: string;
    robloxUrl: string;
  };
  reports: {
    id: string;
    reason: string;
    note: string | null;
    createdAt: string;
    reporter: string;
  }[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

export function AdminReportsClient({ groups }: { groups: ReportGroup[] }) {
  const router = useRouter();
  const { confirm, notify } = useDialogs();
  const busyRef = useRef(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  async function resolve(
    group: ReportGroup,
    resolution: "disable" | "dismiss",
  ) {
    if (busyRef.current) return;

    if (resolution === "disable") {
      const ok = await confirm({
        title: `Nonaktifkan "${group.map.name}"?`,
        description:
          "Map akan hilang dari katalog dan tidak bisa dibuka pengguna. Semua laporan untuk map ini ditandai selesai. Kamu bisa mengaktifkannya lagi dari halaman Maps.",
        confirmLabel: "Nonaktifkan map",
        tone: "danger",
      });

      if (!ok) return;
    }

    busyRef.current = true;
    setBusyKey(`${resolution}-${group.map.id}`);

    let failure: string | null = null;

    try {
      const formData = new FormData();
      formData.set("mapId", group.map.id);
      formData.set("resolution", resolution);
      await resolveReportsAction(formData);
      router.refresh();
    } catch (error) {
      failure =
        error instanceof Error ? error.message : "Aksi gagal dijalankan.";
    } finally {
      busyRef.current = false;
      setBusyKey(null);
    }

    if (failure) {
      await notify({
        title: "Terjadi kesalahan",
        description: failure,
        tone: "danger",
      });
    }
  }

  return (
    <>
      <div>
        <h1 className="text-3xl font-black sm:text-4xl">Laporan</h1>
        <p className="mt-1 text-[color:var(--text-muted)]">
          Laporan pengguna yang belum ditinjau, dikelompokkan per map.
        </p>
      </div>

      <div className="mt-8 space-y-4">
        {groups.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[color:var(--border)] p-8 text-center text-sm text-[color:var(--text-muted)]">
            Tidak ada laporan yang menunggu. 🎉
          </div>
        )}

        {groups.map((group) => (
          <section
            key={group.map.id}
            className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 sm:p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="break-words font-black">{group.map.name}</h2>
                  <Chip size="sm" variant="soft" color="danger">
                    {group.reports.length} laporan
                  </Chip>
                  {group.map.status !== "ACTIVE" && (
                    <Chip size="sm" variant="soft">
                      Nonaktif
                    </Chip>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  {group.map.status === "ACTIVE" && (
                    <Link
                      href={`/maps/${group.map.slug}`}
                      className="text-violet-500 hover:underline"
                    >
                      Buka di RbxDaily
                    </Link>
                  )}
                  <a
                    href={group.map.robloxUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-violet-500 hover:underline"
                  >
                    Buka di Roblox
                    <ExternalLink className="size-3.5" aria-hidden="true" />
                  </a>
                </div>
              </div>

              <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                <Button
                  size="sm"
                  variant="secondary"
                  className={`${skeuoButton("secondary")} flex-1 sm:flex-none`}
                  isDisabled={busyKey === `dismiss-${group.map.id}`}
                  onPress={() => void resolve(group, "dismiss")}
                >
                  <X className="size-4" aria-hidden="true" />
                  Abaikan
                </Button>

                {group.map.status === "ACTIVE" && (
                  <Button
                    size="sm"
                    variant="danger"
                    className={`${skeuoButton("danger")} flex-1 sm:flex-none`}
                    isDisabled={busyKey === `disable-${group.map.id}`}
                    onPress={() => void resolve(group, "disable")}
                  >
                    <EyeOff className="size-4" aria-hidden="true" />
                    Nonaktifkan map
                  </Button>
                )}
              </div>
            </div>

            <ul className="mt-4 space-y-2 border-t border-[color:var(--border)] pt-4">
              {group.reports.map((report) => (
                <li key={report.id} className="text-sm">
                  <span className="font-semibold">
                    {reportReasonLabel(report.reason)}
                  </span>
                  <span className="text-[color:var(--text-muted)]">
                    {" "}
                    · {report.reporter} · {formatDate(report.createdAt)}
                  </span>
                  {report.note && (
                    <p className="mt-0.5 break-words text-[color:var(--text-secondary)]">
                      {report.note}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
