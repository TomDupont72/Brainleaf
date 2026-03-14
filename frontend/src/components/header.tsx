import {
  Button,
  Card,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/index";
import { useEffect, useState } from "react";
import { Sun, Moon, BrainCircuit } from "lucide-react";

type PageHeaderProps = {
  title: string;
  action?: React.ReactNode;
  username?: string;
  onLogout?: () => void;
  auth: boolean;
};

export default function PageHeader({ title, action, username, onLogout, auth }: PageHeaderProps) {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <Card className="min-w-full flex flex-row justify-between items-center p-3">
      <div className="flex flex-row items-center gap-2">
        <BrainCircuit />
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      <div className="flex flex-row items-center gap-2">
        {auth ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="link">{username}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Profil</DropdownMenuItem>
              <DropdownMenuItem>Paramètres</DropdownMenuItem>
              <DropdownMenuItem onClick={onLogout}>Déconnexion</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
        <Button variant="outline" size="icon" onClick={() => setDark(!dark)}>
          {dark ? <Sun /> : <Moon />}
        </Button>
      </div>
      {action && <div>{action}</div>}
    </Card>
  );
}
