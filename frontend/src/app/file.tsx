import PageHeader from "@/components/header";
import { useFile } from "@/hooks/useFile";
import { usePageHeader } from "@/hooks/usePageHeader";
import { useParams } from "react-router-dom";
import {
  Spinner,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from "@/components/ui/index";
import ErrorAlert from "@/components/errorAlert";
import ReactMarkdown from "react-markdown";

export default function File() {
  const { fileKey } = useParams<{ fileKey: string }>();

  const { username, logout } = usePageHeader();
  const { file, loading, error, setError } = useFile(fileKey || "");

  if (loading) {
    return (
      <main className="h-screen flex flex-col">
        <div className="px-3 pt-3">
          <PageHeader title="Brainleaf" username={username} onLogout={logout} auth={true} />
        </div>
        <div className="flex-1 flex justify-center items-center">
          <Spinner className="size-8" />
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen flex flex-col">
      <div className="px-3 pt-3">
        <PageHeader title="Brainleaf" username={username} onLogout={logout} auth={true} />
      </div>
      <div className="flex-1 overflow-y-auto min-h-0 pt-3">
        <div className="flex flex-col gap-8 my-5 px-8">
          <h1 className="text-3xl font-semibold pl-6">{file?.fileMetadata.fileName}</h1>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Resumé</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-justify">{file?.fileContent.summary}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Fiche de révision</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="max-w-none text-sm leading-7
        [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-4
        [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-3
        [&_h3]:text-md [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2
        [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1
        [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-1
        [&_li]:pl-1
        [&_strong]:font-semibold
        [&_p]:mb-3
        [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:bg-white/10"
              >
                <ReactMarkdown>{file?.fileContent.revisionSheet}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">Questionnaire</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple">
                {file?.fileQuestions.map((item) => (
                  <AccordionItem key={item.id} value={String(item.id)}>
                    <AccordionTrigger>{item.question}</AccordionTrigger>
                    <AccordionContent>{item.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
          <ErrorAlert
            error={error}
            className="absolute bottom-8 left-8"
            setErrorToNull={() => setError(null)}
          />
        </div>
      </div>
    </main>
  );
}
