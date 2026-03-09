import PageHeader from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useDashboard } from "@/hooks/useDashboard"

export default function Dashboard() {
    const { username, logout } = useDashboard();

    return (
        <main className="min-h-screen flex flex-col p-3">
            <PageHeader title="Brainleaf" username={username} onLogout={logout} auth={true} />
            <div className="flex-1 flex justify-center items-center">
                <Card className="flex justify-center items-center p-6">
                    <h2 className="text-2xl font-semibold">Aucun document</h2>
                    <p className="text-md font-semi text-muted-foreground">Importer votre premier cours pour commencer</p>
                    <Button variant="outline">Importer un PDF</Button>
                </Card>
            </div>
        </main>
    )
}