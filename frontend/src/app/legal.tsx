import PageHeader from "@/components/header";
import { Card, CardContent } from "@/components/ui";
import { usePageHeader } from "@/hooks/usePageHeader";
import { legal } from "@/models/legal";

export default function Legal() {
  const { username, logout, theme } = usePageHeader();

  return (
    <main className="h-dvh flex flex-col overflow-hidden bg-background">
      <div className="px-3 pt-3 shrink-0">
        <PageHeader
          title="Brainleaf"
          username={username}
          onLogout={logout}
          auth={true}
          theme={theme}
        />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <div className="flex w-full justify-center px-4 py-8 sm:px-8">
          <Card className="w-full max-w-5xl overflow-hidden">
            <CardContent className="flex min-w-0 flex-col gap-10">
              {legal.map((item) => (
                <section key={item.section} className="flex min-w-0 flex-col gap-5">
                  <h1 className="break-words text-xl font-semibold leading-tight">
                    {item.section}
                  </h1>

                  <div className="flex min-w-0 flex-col gap-3">
                    {item.content.map((paragraph, paragraphIndex) => (
                      <p
                        key={`${item.section}-${paragraphIndex}`}
                        className="min-w-0 break-words text-sm leading-7"
                      >
                        {paragraph.content.map((part, partIndex) => {
                          const key = `${item.section}-${paragraphIndex}-${partIndex}`;

                          if (part.type === "link") {
                            return (
                              <a
                                key={key}
                                href={part.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="break-words font-medium underline underline-offset-4 hover:opacity-80"
                              >
                                {part.text}
                              </a>
                            );
                          }

                          return <span key={key}>{part.text}</span>;
                        })}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
