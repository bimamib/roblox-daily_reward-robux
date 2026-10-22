"use client";

import Link from "next/link";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import { approveMapAction, deleteMapAction } from "@/actions/maps";

type MapData = {
  id: string;
  name: string;
  phaseNumber: number;
  durationDays: number;
  status: string;
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
      return "Tidak aktif";
    case "EXPIRED":
      return "Kedaluwarsa";
    default:
      return status;
  }
}

function statusClass(status: string) {
  if (status === "ACTIVE") return "status-pill status-pill--active";
  if (status === "PENDING_REVIEW") return "status-pill status-pill--pending";
  return "status-pill";
}

export function AdminMapsClient({ maps }: { maps: MapData[] }) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-3xl font-black sm:text-4xl">Maps</h1>
          <p className="mt-1 text-default-500">
            CRUD map, approval, reward, dan phase.
          </p>
        </div>

        <Link href="/admin/maps/new" className="btn btn-primary">
          <Plus className="btn-icon" aria-hidden="true" />
          Tambah Map
        </Link>
      </div>

      <div className="mt-8 space-y-3">
        {maps.length === 0 && (
          <div className="rounded-2xl border border-dashed border-default-300 p-8 text-center text-sm text-default-500">
            Belum ada map.
          </div>
        )}

        {maps.map((map) => {
          const totalRobux = map.rewards
            .filter((reward) => reward.rewardType === "ROBUX")
            .reduce((sum, reward) => sum + reward.amount, 0);

          return (
            <div key={map.id} className="admin-map-row">
              <div className="admin-map-info">
                <h2 className="break-words font-black">{map.name}</h2>

                <p className="text-sm text-default-500">
                  Phase {map.phaseNumber} · {map.durationDays} hari ·{" "}
                  {totalRobux.toLocaleString("id-ID")} R$
                </p>
              </div>

              <div className="admin-map-actions">
                <div className="admin-map-status">
                  <span className={statusClass(map.status)}>
                    {statusLabel(map.status)}
                  </span>
                </div>

                <Link
                  href={`/admin/maps/${map.id}/edit`}
                  className="btn btn-secondary"
                >
                  <Pencil className="btn-icon" aria-hidden="true" />
                  Edit
                </Link>

                {map.status === "PENDING_REVIEW" && (
                  <form action={approveMapAction}>
                    <input type="hidden" name="id" value={map.id} />

                    <button type="submit" className="btn btn-secondary">
                      <Check className="btn-icon" aria-hidden="true" />
                      Approve
                    </button>
                  </form>
                )}

                <form
                  action={deleteMapAction}
                  onSubmit={(event) => {
                    if (
                      !window.confirm(
                        `Hapus map "${map.name}"? Tindakan ini tidak dapat dibatalkan.`,
                      )
                    ) {
                      event.preventDefault();
                    }
                  }}
                >
                  <input type="hidden" name="id" value={map.id} />

                  <button type="submit" className="btn btn-danger">
                    <Trash2 className="btn-icon" aria-hidden="true" />
                    Delete
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
