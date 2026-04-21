"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Upload, X, Calendar as CalendarIcon } from "lucide-react";
import * as auctionServices from "@/services/auctionServices";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { formatNumber, parseNumber } from "@/utils/format";

const auctionSchema = z.object({
  name: z.string().min(10, "Tên sản phẩm ít nhất 10 ký tự"),
  description: z.string().min(20, "Mô tả ít nhất 20 ký tự"),
  categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
  startingPrice: z.string().min(1, "Vui lòng nhập giá khởi điểm"),
  bidIncrement: z.string().min(1, "Vui lòng nhập bước giá"),
  startTime: z.date({ message: "Chọn ngày bắt đầu" }),
  endTime: z.date({ message: "Chọn ngày kết thúc" }),
});

export function CreateAuctionForm({ categories }: { categories: any[] }) {
  const router = useRouter();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(auctionSchema),
    defaultValues: {
      name: "",
      description: "",
      categoryId: "",
      startingPrice: "",
      bidIncrement: "",
      startTime: new Date(),
      endTime: new Date(Date.now() + 86400000), // 86400000 = 1 day
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (selectedFiles.length + files.length > 5) {
      return toast.error("Chỉ được tải lên tối đa 5 ảnh");
    }
    setSelectedFiles((prev) => [...prev, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    if (previews[index]) {
      URL.revokeObjectURL(previews[index]);
    }

    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: any) => {
    if (selectedFiles.length === 0)
      return toast.error("Vui lòng tải lên ít nhất 1 ảnh");

    const formData = new FormData();
    // 1. Đẩy các trường text vào FormData
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("categoryId", data.categoryId);
    formData.append("startingPrice", data.startingPrice);
    formData.append("bidIncrement", data.bidIncrement);
    formData.append("startTime", data.startTime.toISOString());
    formData.append("endTime", data.endTime.toISOString());

    // 2. Đẩy mảng ảnh vào FormData (Backend dùng FilesInterceptor('files'))
    selectedFiles.forEach((file) => formData.append("files", file));

    // 3. Gọi Service
    const result = await auctionServices.createAuction(formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Đăng sản phẩm thành công! Đang chờ duyệt.");
      router.push("/profile"); // Quay về tab sản phẩm của tôi
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 bg-white p-8 rounded-2xl border shadow-sm"
    >
      {/* PHẦN ẢNH */}
      <div className="space-y-4">
        <FieldLabel>Hình ảnh sản phẩm (Tối đa 5 ảnh)</FieldLabel>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {previews.map((src, i) => (
            <div
              key={i}
              className="relative aspect-square rounded-xl overflow-hidden border-2 border-slate-100"
            >
              <img src={src} className="w-full h-full object-cover" alt="" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 rounded-full"
                onClick={() => removeImage(i)}
              >
                <X size={12} />
              </Button>
            </div>
          ))}
          {previews.length < 5 && (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl aspect-square cursor-pointer hover:bg-slate-50 hover:border-primary/50 transition-all">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-xs font-medium mt-2">Thêm ảnh</span>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
                accept="image/*"
              />
            </label>
          )}
        </div>
      </div>

      {/* CÁC TRƯỜNG NHẬP LIỆU CÒN LẠI DÙNG CONTROLLER... */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <Field className="md:col-span-2">
              <FieldLabel>Tên sản phẩm</FieldLabel>
              <Input
                placeholder="Ví dụ: iPhone 15 Pro Max Chính Hãng..."
                {...field}
              />
              {errors.name && (
                <FieldError>{errors.name.message as string}</FieldError>
              )}
            </Field>
          )}
        />
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <Field className="md:col-span-2">
              <FieldLabel>Mô tả sản phẩm</FieldLabel>
              <Textarea
                placeholder="Mô tả chi tiết về tình trạng, cấu hình, xuất xứ..."
                className="min-h-[120px]"
                {...field}
              />
              {errors.description && (
                <FieldError>{errors.description.message as string}</FieldError>
              )}
            </Field>
          )}
        />

        <Controller
          control={control}
          name="categoryId"
          render={({ field }) => (
            <Field>
              <FieldLabel>Danh mục</FieldLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <FieldError>{errors.categoryId.message as string}</FieldError>
              )}
            </Field>
          )}
        />

        <Controller
          control={control}
          name="startingPrice"
          render={({ field }) => (
            <Field>
              <FieldLabel>Giá khởi điểm (VNĐ)</FieldLabel>
              <Input
                {...field}
                value={formatNumber(parseNumber(field.value))}
                onChange={(e) => {
                  const numeric = parseNumber(e.target.value);
                  field.onChange(numeric.toString());
                }}
                type="text"
                placeholder="0"
              />
              {errors.startingPrice && (
                <FieldError>
                  {errors.startingPrice.message as string}
                </FieldError>
              )}
            </Field>
          )}
        />

        <Controller
          control={control}
          name="bidIncrement"
          render={({ field }) => (
            <Field>
              <FieldLabel>Bước giá tối thiểu (VNĐ)</FieldLabel>
              <Input
                {...field}
                value={formatNumber(parseNumber(field.value))}
                onChange={(e) => {
                  const numeric = parseNumber(e.target.value);
                  field.onChange(numeric.toString());
                }}
                type="text"
                placeholder="50.000"
              />
              {errors.bidIncrement && (
                <FieldError>{errors.bidIncrement.message as string}</FieldError>
              )}
            </Field>
          )}
        />

        <Controller
          control={control}
          name="startTime"
          render={({ field }) => (
            <Field>
              <FieldLabel>Thời gian bắt đầu</FieldLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !field.value && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? (
                      format(field.value, "dd/MM/yyyy HH:mm")
                    ) : (
                      <span>Chọn ngày giờ</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      if (!date) return;
                      const newDate = new Date(date);
                      newDate.setHours(field.value.getHours());
                      newDate.setMinutes(field.value.getMinutes());
                      field.onChange(newDate);
                    }}
                    initialFocus
                  />
                  <div className="p-3 border-t border-border flex items-center gap-3 justify-center bg-slate-50/50">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase text-muted-foreground font-bold px-1">
                        Giờ
                      </span>
                      <Select
                        value={field.value?.getHours().toString()}
                        onValueChange={(v) => {
                          const newDate = new Date(field.value);
                          newDate.setHours(parseInt(v));
                          field.onChange(newDate);
                        }}
                      >
                        <SelectTrigger className="w-[70px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          {Array.from({ length: 24 }).map((_, i) => (
                            <SelectItem key={i} value={i.toString()}>
                              {i.toString().padStart(2, "0")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase text-muted-foreground font-bold px-1">
                        Phút
                      </span>
                      <Select
                        value={field.value?.getMinutes().toString()}
                        onValueChange={(v) => {
                          const newDate = new Date(field.value);
                          newDate.setMinutes(parseInt(v));
                          field.onChange(newDate);
                        }}
                      >
                        <SelectTrigger className="w-[70px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          {Array.from({ length: 60 }).map((_, i) => (
                            <SelectItem key={i} value={i.toString()}>
                              {i.toString().padStart(2, "0")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              {errors.startTime && (
                <FieldError>{errors.startTime.message as string}</FieldError>
              )}
            </Field>
          )}
        />

        <Controller
          control={control}
          name="endTime"
          render={({ field }) => (
            <Field>
              <FieldLabel>Thời gian kết thúc</FieldLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !field.value && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? (
                      format(field.value, "dd/MM/yyyy HH:mm")
                    ) : (
                      <span>Chọn ngày giờ</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      if (!date) return;
                      const newDate = new Date(date);
                      newDate.setHours(field.value.getHours());
                      newDate.setMinutes(field.value.getMinutes());
                      field.onChange(newDate);
                    }}
                    initialFocus
                  />
                  <div className="p-3 border-t border-border flex items-center gap-3 justify-center bg-slate-50/50">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase text-muted-foreground font-bold px-1">
                        Giờ
                      </span>
                      <Select
                        value={field.value?.getHours().toString()}
                        onValueChange={(v) => {
                          const newDate = new Date(field.value);
                          newDate.setHours(parseInt(v));
                          field.onChange(newDate);
                        }}
                      >
                        <SelectTrigger className="w-[70px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          {Array.from({ length: 24 }).map((_, i) => (
                            <SelectItem key={i} value={i.toString()}>
                              {i.toString().padStart(2, "0")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase text-muted-foreground font-bold px-1">
                        Phút
                      </span>
                      <Select
                        value={field.value?.getMinutes().toString()}
                        onValueChange={(v) => {
                          const newDate = new Date(field.value);
                          newDate.setMinutes(parseInt(v));
                          field.onChange(newDate);
                        }}
                      >
                        <SelectTrigger className="w-[70px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          {Array.from({ length: 60 }).map((_, i) => (
                            <SelectItem key={i} value={i.toString()}>
                              {i.toString().padStart(2, "0")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              {errors.endTime && (
                <FieldError>{errors.endTime.message as string}</FieldError>
              )}
            </Field>
          )}
        />
      </div>

      <Button
        type="submit"
        className="w-full h-12 text-lg font-bold"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Đang xử lý..." : "GỬI YÊU CẦU ĐĂNG BÀI"}
      </Button>
    </form>
  );
}
