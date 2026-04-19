import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, QrCode, CreditCard } from "lucide-react";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: string;
  description: string;
}

export default function PaymentModal({ open, onClose, onSuccess, amount, description }: PaymentModalProps) {
  const [tab, setTab] = useState<"pix" | "card">("pix");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSuccess();
        onClose();
      }, 1500);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Pagamento — {amount}</DialogTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center py-8 animate-scale-in">
            <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-primary-foreground" />
            </div>
            <p className="font-heading font-bold text-lg">Pagamento confirmado!</p>
          </div>
        ) : (
          <>
            <div className="flex border-b border-border mb-4">
              <button
                className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${tab === "pix" ? "border-accent text-accent" : "border-transparent text-muted-foreground"}`}
                onClick={() => setTab("pix")}
              >
                <QrCode className="h-4 w-4" /> PIX
              </button>
              <button
                className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${tab === "card" ? "border-accent text-accent" : "border-transparent text-muted-foreground"}`}
                onClick={() => setTab("card")}
              >
                <CreditCard className="h-4 w-4" /> Cartão
              </button>
            </div>

            {tab === "pix" ? (
              <div className="flex flex-col items-center gap-4">
                <div className="h-40 w-40 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                  <QrCode className="h-20 w-20 text-muted-foreground" />
                </div>
                <div className="w-full">
                  <p className="text-xs text-muted-foreground mb-1">Código PIX copia e cola:</p>
                  <Input readOnly value="00020126580014br.gov.bcb.pix0136agroaluga-pagamento-simulado" className="text-xs" />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Input placeholder="Número do cartão" maxLength={19} />
                <Input placeholder="Nome no cartão" />
                <div className="flex gap-3">
                  <Input placeholder="MM/AA" maxLength={5} />
                  <Input placeholder="CVV" maxLength={4} type="password" />
                </div>
              </div>
            )}

            <Button className="w-full mt-4 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold" onClick={handlePay} disabled={processing}>
              {processing ? "Processando..." : "Confirmar Pagamento"}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
