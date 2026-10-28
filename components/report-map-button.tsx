"use client";

import { useState } from "react";
import {
  Button,
  Label,
  ListBox,
  Modal,
  Select,
  TextArea,
  TextField,
} from "@heroui/react";
import { CircleAlert } from "lucide-react";
import { reportMapAction } from "@/actions/maps";
import { useDialogs } from "@/components/dialog-provider";
import { reportReasons } from "@/lib/report-reasons";
import {
  listBoxClass,
  optionClass,
  popoverClass,
  selectTriggerClass,
  skeuoButton,
  textareaClass,
  textareaShellClass,
} from "@/lib/ui";

/**
 * Tombol + dialog "Laporkan map" (HeroUI Modal, dikontrol lewat
 * isOpen / onOpenChange pada Modal.Backdrop).
 */
export function ReportMapButton({
  mapId,
  mapName,
}: {
  mapId: string;
  mapName: string;
}) {
  const { notify } = useDialogs();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>("WRONG_URL");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);

  async function submit() {
    if (sending) return;

    setSending(true);

    let failure: string | null = null;

    try {
      await reportMapAction({ mapId, reason, note });
    } catch (error) {
      failure =
        error instanceof Error ? error.message : "Gagal mengirim laporan.";
    } finally {
      setSending(false);
    }

    // Tutup dialog laporan dulu agar tidak ada dua overlay bertumpuk.
    setOpen(false);

    if (failure) {
      await notify({
        title: "Laporan gagal dikirim",
        description: failure,
        tone: "danger",
      });
      return;
    }

    setNote("");

    await notify({
      title: "Laporan terkirim",
      description: "Terima kasih. Admin akan meninjau map ini.",
      tone: "success",
    });
  }

  return (
    <>
      <Button
        size="sm"
        variant="secondary"
        className={`${skeuoButton("secondary")} items-center gap-2 leading-none`}
        onPress={() => setOpen(true)}
      >
        <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
        Laporkan map
      </Button>

      <Modal.Backdrop variant="blur" isOpen={open} onOpenChange={setOpen}>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-[440px]">
            <Modal.CloseTrigger />

            <Modal.Header>
              <Modal.Icon className="bg-danger-soft text-danger-soft-foreground">
                <CircleAlert className="size-5" aria-hidden="true" />
              </Modal.Icon>
              <Modal.Heading>Laporkan map</Modal.Heading>
            </Modal.Header>

            <Modal.Body className="space-y-4">
              <p className="text-sm leading-6">
                Laporan untuk “{mapName}”. Admin akan meninjau dan bisa
                menonaktifkan map jika memang bermasalah.
              </p>

              <Select
                selectedKey={reason}
                onSelectionChange={(key) =>
                  key != null && setReason(String(key))
                }
              >
                <Label>Alasan</Label>

                <Select.Trigger className={selectTriggerClass}>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>

                <Select.Popover className={popoverClass}>
                  <ListBox className={listBoxClass}>
                    {reportReasons.map((item) => (
                      <ListBox.Item
                        key={item.id}
                        id={item.id}
                        textValue={item.label}
                        className={optionClass}
                      >
                        {item.label}
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>

              <TextField value={note} onChange={setNote}>
                <Label>Keterangan (opsional)</Label>
                <div className={textareaShellClass}>
                  <TextArea
                    className={textareaClass}
                    placeholder="Jelaskan masalahnya singkat saja"
                    maxLength={500}
                    rows={3}
                  />
                </div>
              </TextField>
            </Modal.Body>

            <Modal.Footer>
              <Button
                variant="secondary"
                className={skeuoButton("secondary")}
                onPress={() => setOpen(false)}
              >
                Batal
              </Button>

              <Button
                variant="danger"
                className={skeuoButton("danger")}
                isDisabled={sending}
                onPress={() => void submit()}
              >
                Kirim laporan
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </>
  );
}
