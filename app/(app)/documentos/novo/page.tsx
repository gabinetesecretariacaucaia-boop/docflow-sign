import { UploadForm } from "@/components/documents/upload-form";

export default function NewDocumentPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Enviar documento</h1>
      <UploadForm />
    </section>
  );
}
