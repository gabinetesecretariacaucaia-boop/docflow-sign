import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

type Payload = {
  to: string;
  documentTitle: string;
  appUrl: string;
};

async function sendEmail(subject: string, html: string, to: string) {
  if (!resend) return;
  const from = process.env.EMAIL_FROM || "DocFlow <noreply@example.com>";
  try {
    await resend.emails.send({
      from,
      to,
      subject,
      html
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[email] Falha ao enviar e-mail (${subject}) para ${to}: ${message}`);
  }
}

export async function sendDocumentSentEmail({ to, documentTitle, appUrl }: Payload) {
  await sendEmail(
    `Novo documento para assinatura: ${documentTitle}`,
    `<p>Você recebeu um documento para assinatura externa.</p><p><a href="${appUrl}/dashboard">Abrir plataforma</a></p>`,
    to
  );
}

export async function sendSignedUploadedEmail({ to, documentTitle, appUrl }: Payload) {
  await sendEmail(
    `Documento assinado disponível: ${documentTitle}`,
    `<p>O documento assinado foi carregado.</p><p><a href="${appUrl}/dashboard">Baixar documento</a></p>`,
    to
  );
}

export async function sendSenderDownloadedEmail({ to, documentTitle, appUrl }: Payload) {
  await sendEmail(
    `Download final concluído: ${documentTitle}`,
    `<p>O remetente baixou o documento assinado.</p><p><a href="${appUrl}/atividades">Ver atividade</a></p>`,
    to
  );
}
