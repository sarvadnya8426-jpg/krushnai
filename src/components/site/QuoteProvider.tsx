import { site } from "@/config/site";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2 } from "lucide-react";
import { z } from "zod";

type QuoteContextValue = { openQuote: (productName?: string) => void };

const QuoteContext = createContext<QuoteContextValue>({ openQuote: () => {} });

export const useQuote = () => useContext(QuoteContext);

const schema = z.object({
  product: z.string().trim().min(1, "Please mention the product or requirement").max(120),
  name: z.string().trim().min(2, "Please enter your name").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^[+]?[0-9\s-]{10,15}$/, "Enter a valid phone number"),
  quantity: z.string().trim().max(40).optional(),
  message: z.string().trim().max(600).optional(),
});

export function QuoteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [product, setProduct] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const openQuote = useCallback((productName?: string) => {
    setProduct(productName ?? "");
    setSubmitted(false);
    setErrors({});
    setOpen(true);
  }, []);

  const value = useMemo(() => ({ openQuote }), [openQuote]);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const data = {
    product: String(form.get("product") ?? ""),
    name: String(form.get("name") ?? ""),
    phone: String(form.get("phone") ?? ""),
    quantity: String(form.get("quantity") ?? ""),
    message: String(form.get("message") ?? ""),
  };
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const next: Record<string, string> = {};
    for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
    setErrors(next);
    return;
  }
  setErrors({});

  // Build a WhatsApp message from the form data
  const lines = [
    `New Quote Request`,
    `Product/Requirement: ${data.product}`,
    `Name: ${data.name}`,
    `Phone: ${data.phone}`,
    data.quantity ? `Quantity: ${data.quantity}` : null,
    data.message ? `Message: ${data.message}` : null,
  ].filter(Boolean);

  const whatsappMessage = lines.join("\n");
  const url = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`;

  // Open WhatsApp with the pre-filled message
  window.open(url, "_blank", "noopener,noreferrer");

  setSubmitted(true);
};

  return (
    <QuoteContext.Provider value={value}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          {submitted ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-accent" aria-hidden />
              <h3 className="mt-4 text-xl">Thank you!</h3>
              <p className="mt-2 text-sm text-muted-foreground">
  We've opened WhatsApp with your details filled in — just hit send to reach our team.
</p>
              <Button className="mt-6" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">Request a Quote</DialogTitle>
                <DialogDescription>
                  Share your requirement and our team will get back with pricing and availability.
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4" onSubmit={onSubmit} noValidate>
                <Field id="product" label="Product / Requirement" error={errors["product"]}>
                  <Input
                    id="product"
                    name="product"
                    defaultValue={product}
                    placeholder="e.g. BWP Plywood 19mm"
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id="name" label="Your Name" error={errors["name"]}>
                    <Input id="name" name="name" placeholder="Full name" />
                  </Field>
                  <Field id="phone" label="Phone Number" error={errors["phone"]}>
                    <Input id="phone" name="phone" type="tel" placeholder="10-digit mobile number" />
                  </Field>
                </div>
                <Field id="quantity" label="Quantity (optional)" error={errors["quantity"]}>
                  <Input id="quantity" name="quantity" placeholder="e.g. 20 sheets" />
                </Field>
                <Field id="message" label="Message (optional)" error={errors["message"]}>
                  <Textarea id="message" name="message" rows={3} placeholder="Any details that help us quote accurately" />
                </Field>
                <Button type="submit" size="lg" className="w-full">
                  Request Quote
                </Button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </QuoteContext.Provider>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string | undefined;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
