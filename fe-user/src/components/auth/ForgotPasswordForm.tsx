"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import z from "zod";
import * as authServices from "@/services/authServices";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Link from "next/link";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập email")
    .email("Email không hợp lệ"),
});

export function ForgotPasswordForm() {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(data: z.infer<typeof forgotPasswordSchema>) {
    const result = await authServices.forgotPassword(data.email);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Gửi mã OTP thành công!");

      router.push("/reset-password");
    }
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold">
          Quên mật khẩu?
        </CardTitle>
        <CardDescription className="text-center">
          Nhập email của bạn và chúng tôi sẽ gửi cho bạn một mã OTP để đặt lại
          mật khẩu.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  {...field}
                />
                {errors.email && (
                  <FieldError>{errors.email.message}</FieldError>
                )}
              </Field>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Đang gửi..." : "Gửi"}
          </Button>

          <div className="text-center text-sm text-muted-foreground mt-4">
            Quay lại đăng nhập?{" "}
            <Link
              href="/login"
              className="font-medium text-primary underline underline-offset-4 hover:opacity-80 transition-opacity"
            >
              Đăng nhập tại đây
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
