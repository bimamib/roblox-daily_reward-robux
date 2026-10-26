"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Chip } from "@heroui/react";
import { Check, Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import {
  approveMapAction,
  deleteMapAction,
  setMapStatusAction,
} from "@/actions/maps";
import { useDialogs } from "@/components/dialog-provider";
import { linkButton, skeuoButton } from "@/lib/ui";

type MapData = {
  id: string;
  name: string;
  phaseNumber: number;
  durationDays: number;
  status: string;
  openReports: number;
  rewards: {
    id: string;
    rewardType: string;
    amount: number;
  }[];
};

function statusLabel(status: string) {
  switch (status) {
    case "ACTIVE":
      return "Aktif";
    case "PENDING_REVIEW":
      return "Menunggu review";
    case "INACTIVE":
      return "Nonaktif";
    case "EXPIRED":
      return "Kedaluwarsa";
    default:
      return status;
  }
}

function statusColor(status: string): "success" | "warning" | "default" {
  if (status === "ACTIVE") return "success";
  if (status === "PENDING_REVIEW") return "warning";
  return "default";
}

export function AdminMapsClient({ maps }: { maps: MapData[] }) {
  const router = useRouter();
  const { confirm, notify } = useDialogs();
  const busyRef = useRef(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  async function runAction(
    key: string,
    action: (formData: FormData) => Promise<void>,
    id: string,
    extra: Record<string, string> = {},
  ) {
    if (busyRef.current) return;

    busyRef.current = true;
    setBusyKey(key);

    let failure: string | null = null;

    try {
      const formData = new FormData();
      formData.set("id", id);

      for (const [name, value] of Object.entries(extra)) {
        formData.set(name, value);
      }

      await action(formData);
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

  async function handleDelete(map: MapData) {
    const ok = await confirm({
      title: `Hapus "${map.name}"?`,
      description:
        "Map beserta reward dan riwayat absensinya akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.",
      confirmLabel: "Hapus map",
      tone: "danger",
    });

    if (ok) await runAction(`delete-${map.id}`, deleteMapAction, map.id);
  }

  async function handleToggle(map: MapData) {
    const disabling = map.status === "ACTIVE";

    if (disabling) {
      const ok = await confirm({
        title: `Nonaktifkan "${map.name}"?`,
        description:
          "Map akan hilang dari katalog dan tidak bisa dibuka pengguna, termasuk yang sudah memakainya. Data absensi mereka tetap aman dan kembali muncul jika map diaktifkan lagi.",
        confirmLabel: "Nonaktifkan",
        tone: "warning",
      });

      if (!ok) return;
    }

    await runAction(`toggle-${map.id}`, setMapStatusAction, map.id, {
      status: disabling ? "INACTIVE" : "ACTIVE",
    });
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-3xl font-black sm:text-4xl">Maps</h1>
          <p className="mt-1 text-[color:var(--text-muted)]">
            CRUD map, approval, reward, dan phase.
          </p>
        </div>

        <Link href="/admin/maps/new" className={linkButton("primary")}>
          <Plus className="size-4" aria-hidden="true" />
          Tambah Map
        </Link>
      </div>

      <div className="mt-8 space-y-3">
        {maps.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[color:var(--border)] p-8 text-center text-sm text-[color:var(--text-muted)]">
            Belum ada map.
          </div>
        )}

        {maps.map((map) => {
          const totalRobux = map.rewards
            .filter((reward) => reward.rewardType === "ROBUX")
            .reduce((sum, reward) => sum + reward.amount, 0);

          const canToggle =
            map.status === "ACTIVE" || map.status === "INACTIVE";

          return (
            <div
              key={map.id}
              className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 sm:px-5"
            >
              <div className="min-w-0 flex-1 basis-56">
                <h2 className="break-words font-black">{map.name}</h2>

                <p className="text-sm text-[color:var(--text-muted)]">
                  Phase {map.phaseNumber} · {map.durationDays} hari ·{" "}
                  {totalRobux.toLocaleString("id-ID")} R$
                </p>
              </div>

              <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                {/* Pembungkus: di mobile chip mendapat baris sendiri tanpa melebar. */}
                <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                  <Chip
                    size="sm"
                    variant="soft"
                    color={statusColor(map.status)}
                  >
                    {statusLabel(map.status)}
                  </Chip>

                  {map.openReports > 0 && (
                    <Link href="/admin/reports">
                      <Chip size="sm" variant="soft" color="danger">
                        {map.openReports} laporan
                      </Chip>
                    </Link>
                  )}
                </div>

                <Link
                  href={`/admin/maps/${map.id}/edit`}
                  className={`${linkButton("secondary", "sm")} flex-1 sm:flex-none`}
                >
                  <Pencil className="size-4" aria-hidden="true" />
                  Edit
                </Link>

                {map.status === "PENDING_REVIEW" && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className={`${skeuoButton("secondary")} flex-1 sm:flex-none`}
                    isDisabled={busyKey === `approve-${map.id}`}
                    onPress={() =>
                      void runAction(
                        `approve-${map.id}`,
                        approveMapAction,
                        map.id,
                      )
                    }
                  >
                    <Check className="size-4" aria-hidden="true" />
                    Approve
                  </Button>
                )}

                {canToggle && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className={`${skeuoButton("secondary")} flex-1 sm:flex-none`}
                    isDisabled={busyKey === `toggle-${map.id}`}
                    onPress={() => void handleToggle(map)}
                  >
                    {map.status === "ACTIVE" ? (
                      <EyeOff className="size-4" aria-hidden="true" />
                    ) : (
                      <Eye className="size-4" aria-hidden="true" />
                    )}
                    {map.status === "ACTIVE" ? "Nonaktifkan" : "Aktifkan"}
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="danger"
                  className={`${skeuoButton("danger")} flex-1 sm:flex-none`}
                  isDisabled={busyKey === `delete-${map.id}`}
                  onPress={() => void handleDelete(map)}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  Delete
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
