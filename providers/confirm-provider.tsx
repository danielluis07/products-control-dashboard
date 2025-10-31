"use client";

import {
  createContext,
  useContext,
  useCallback,
  useState,
  ReactNode,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ConfirmState = {
  title: string;
  message: string;
  resolve: (value: boolean) => void;
} | null;

type ConfirmContextType = {
  confirm: (title: string, message: string) => Promise<boolean>;
  closeConfirm: () => void;
  setPending: (value: boolean) => void;
};

const ConfirmContext = createContext<ConfirmContextType>({
  confirm: () => Promise.resolve(false),
  closeConfirm: () => {},
  setPending: () => {},
});

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const [isPending, setIsPending] = useState(false);

  const confirm = useCallback((title: string, message: string) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({ title, message, resolve });
      setIsPending(false); // reset ao abrir
    });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmState(null);
    setIsPending(false);
  }, []);

  const setPending = useCallback((value: boolean) => {
    setIsPending(value);
  }, []);

  const handleConfirm = useCallback(() => {
    if (confirmState) {
      confirmState.resolve(true);
    }
  }, [confirmState]);

  const handleCancel = useCallback(() => {
    confirmState?.resolve(false);
    setConfirmState(null);
    setIsPending(false);
  }, [confirmState]);

  return (
    <ConfirmContext.Provider value={{ confirm, closeConfirm, setPending }}>
      {children}
      {confirmState && (
        <Dialog open={true} onOpenChange={handleCancel}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{confirmState.title}</DialogTitle>
              <DialogDescription>{confirmState.message}</DialogDescription>
            </DialogHeader>
            <DialogFooter className="pt-2">
              <Button
                onClick={handleCancel}
                variant="outline"
                disabled={isPending}>
                Cancelar
              </Button>
              <Button
                onClick={handleConfirm}
                variant="destructive"
                disabled={isPending}>
                {isPending ? "Excluindo..." : "Confirmar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => useContext(ConfirmContext);
