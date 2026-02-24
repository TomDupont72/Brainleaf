import { Button, Card } from "@/components/ui/index"
import { useEffect, useState } from "react";
import { Sun, Moon, BrainCircuit } from "lucide-react"

type PageHeaderProps = {
  title: string;
  action?: React.ReactNode;
};

export default function PageHeader({ title, action }: PageHeaderProps) {
    const [dark, setDark] = useState(true);

    useEffect(() => {
        document.documentElement.classList.toggle("dark", dark);
    }, [dark]);

  return (
    <Card className="min-w-full flex flex-row justify-between items-center p-3">
      <div className="flex flex-row items-center gap-2">
        <BrainCircuit/>
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      <Button variant="outline" size="icon" onClick={() => setDark(!dark)}>{dark ? <Sun/>: <Moon/>}</Button>

      {action && (
        <div>
          {action}
        </div>
      )}
    </Card>
  );
}