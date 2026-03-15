import { Alert, AlertDescription, AlertTitle, Button } from "@/components/ui/index";
import { AlertCircleIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type ErrorAlertProps = {
  error: string | null;
  className?: string;
  setErrorToNull: () => void;
};

export default function ErrorAlert({ error, className, setErrorToNull }: ErrorAlertProps) {
  if (!error) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="error"
        className={className}
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
        transition={{ duration: 0.25 }}
      >
        <Alert variant="destructive" className="max-w-md">
          <Button
            variant="outline"
            size="icon"
            className="absolute right-3 top-3 size-2"
            onClick={setErrorToNull}
          >
            <X />
          </Button>
          <AlertCircleIcon />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </motion.div>
    </AnimatePresence>
  );
}
