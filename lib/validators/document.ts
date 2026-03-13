import { z } from "zod";

export const createDocumentSchema = z.object({
  title: z.string().min(2, "Título é obrigatório"),
  receiverEmail: z.email("E-mail inválido"),
  base64File: z.string().min(10, "Arquivo inválido"),
  fileName: z.string().min(3, "Nome de arquivo inválido")
});

export const uploadSignedSchema = z.object({
  base64File: z.string().min(10, "Arquivo inválido"),
  fileName: z.string().min(3, "Nome de arquivo inválido")
});
