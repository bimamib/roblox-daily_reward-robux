"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AlertDialog, Button } from "@heroui/react";
import { skeuoButton } from "@/lib/ui";

/**
 * Pengganti window.confirm() dan window.alert() memakai AlertDialog HeroUI v3.
 *
 *   const { confirm, notify } = useDialogs();
 *   const ok = await confirm({ title: "Hapus map?", tone: "danger" });
 *   await notify({ title: "Gagal", description: "...", tone: "danger" });
 *
 * Dialog dikontrol lewat state (isOpen / onOpenChange pada AlertDialog.Backdrop),
 * tanpa tombol pemicu, sesuai contoh "Controlled State" di dokumentasi HeroUI.
 */

type Tone = "danger" | "warning" | "accent" | "success";

type ConfirmOptions = {
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: Tone;
};

type NoticeOptions = {
  title: string;
  description?: ReactNode;
  okLabel?: string;
  tone?: Tone;
};

type Content =
  | ({ kind: "confirm" } & ConfirmOptions)
  | ({ kind: "notice" } & NoticeOptions);

type DialogApi = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  notify: (options: NoticeOptions) => Promise<void>;
};

const DialogContext = createContext<DialogApi | null>(null);

export function useDialogs(): DialogApi {
  const api = useContext(DialogContext);

  if (!api) {
    throw new Error("useDialogs harus dipakai di dalam <DialogProvider>.");
  }

  return api;
}

export function DialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  // `content` dipertahankan setelah ditutup agar animasi keluar tetap utuh.
  const [content, setContent] = useState<Content | null>(null);
  const resolverRef = useRef<((result: boolean) => void) | null>(null);

  const finish = useCallback((result: boolean) => {
    const resolve = resolverRef.current;
    resolverRef.current = null;
    setOpen(false);
    resolve?.(result);
  }, []);

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        resolverRef.current?.(false);
        resolverRef.current = resolve;
        setContent({ kind: "confirm", ...options });
        setOpen(true);
      }),
    [],
  );

  const notify = useCallback(
    (options: NoticeOptions) =>
      new Promise<void>((resolve) => {
        resolverRef.current?.(false);
        resolverRef.current = () => resolve();
        setContent({ kind: "notice", ...options });
        setOpen(true);
      }),
    [],
  );

  const api = useMemo<DialogApi>(
    () => ({ confirm, notify }),
    [confirm, notify],
  );

  const tone: Tone =
    content?.tone ?? (content?.kind === "notice" ? "danger" : "warning");
  const isDanger = tone === "danger";

  return (
    <DialogContext.Provider value={api}>
      {children}

      {content && (
        <AlertDialog.Backdrop
          variant="blur"
          isOpen={open}
          isKeyboardDismissDisabled={false}
          onOpenChange={(next) => {
            if (!next) finish(false);
          }}
        >
          <AlertDialog.Container>
            <AlertDialog.Dialog className="sm:max-w-[440px]">
              <AlertDialog.CloseTrigger />

              <AlertDialog.Header>
                <AlertDialog.Icon status={tone} />
                <AlertDialog.Heading>{content.title}</AlertDialog.Heading>
              </AlertDialog.Header>

              {content.description && (
                <AlertDialog.Body>
                  <p className="text-sm leading-6">{content.description}</p>
                </AlertDialog.Body>
              )}

              <AlertDialog.Footer>
                {content.kind === "confirm" && (
                  <Button
                    variant="secondary"
                    className={skeuoButton("secondary")}
                    onPress={() => finish(false)}
                  >
                    {content.cancelLabel ?? "Batal"}
                  </Button>
                )}

                <Button
                  variant={isDanger ? "danger" : "primary"}
                  className={skeuoButton(isDanger ? "danger" : "primary")}
                  onPress={() => finish(true)}
                >
                  {content.kind === "confirm"
                    ? (content.confirmLabel ?? "Ya, lanjutkan")
                    : (content.okLabel ?? "Mengerti")}
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      )}
    </DialogContext.Provider>
  );
}
