import { z } from "zod"

export const dealerRegistrationSchema = z.object({
  email: z.string().email("Geçerli bir email adresi giriniz"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
  confirmPassword: z.string(),
  companyName: z.string().min(2, "Firma adı en az 2 karakter olmalıdır"),
  contactName: z.string().min(2, "Yetkili adı en az 2 karakter olmalıdır"),
  phone: z.string().min(10, "Telefon numarası en az 10 karakter olmalıdır"),
  address: z.string().optional(),
  city: z.string().optional(),
  taxNumber: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
})

export type DealerRegistrationFormData = z.infer<typeof dealerRegistrationSchema>

export const dealerLoginSchema = z.object({
  email: z.string().email("Geçerli bir email adresi giriniz"),
  password: z.string().min(1, "Şifre gereklidir"),
})

export type DealerLoginFormData = z.infer<typeof dealerLoginSchema>

export const dealerUpdateSchema = z.object({
  companyName: z.string().min(2, "Firma adı en az 2 karakter olmalıdır").optional(),
  contactName: z.string().min(2, "Yetkili adı en az 2 karakter olmalıdır").optional(),
  phone: z.string().min(10, "Telefon numarası en az 10 karakter olmalıdır").optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  taxNumber: z.string().optional(),
})

export type DealerUpdateFormData = z.infer<typeof dealerUpdateSchema>
