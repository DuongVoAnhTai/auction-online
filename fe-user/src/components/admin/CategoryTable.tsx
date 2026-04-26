"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import * as categoryServices from "@/services/categoryServices";

export function CategoryTable({ initialData }: { initialData: any[] }) {
  const [categories, setCategories] = useState(initialData);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", slug: "" });

  // Tự động tạo slug khi gõ tên (Dành cho UX xịn)
  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-");
    setFormData({ name, slug });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.slug)
      return toast.error("Vui lòng điền đủ thông tin");

    let res;
    if (editingId) {
      res = await categoryServices.updateCategory(editingId, formData);
    } else {
      res = await categoryServices.createCategory(formData);
    }

    if (!res.error) {
      toast.success(editingId ? "Đã cập nhật" : "Đã thêm thành công");
      setIsOpen(false);
      window.location.reload(); // Hoặc update state thủ công cho mượt
    } else {
      toast.error(res.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa?")) return;
    const res = await categoryServices.deleteCategory(id);
    if (!res.error) {
      setCategories(categories.filter((c) => c.id !== id));
      toast.success("Đã xóa");
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={() => {
          setEditingId(null);
          setFormData({ name: "", slug: "" });
          setIsOpen(true);
        }}
      >
        <Plus className="mr-2 h-4 w-4" /> Thêm danh mục
      </Button>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="text-left p-4">Tên danh mục</th>
              <th className="text-left p-4">Slug</th>
              <th className="text-right p-4">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td className="p-4 font-medium">{cat.name}</td>
                <td className="p-4 text-muted-foreground">{cat.slug}</td>
                <td className="p-4 text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingId(cat.id);
                      setFormData({ name: cat.name, slug: cat.slug });
                      setIsOpen(true);
                    }}
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500"
                    onClick={() => handleDelete(cat.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Sửa danh mục" : "Thêm danh mục mới"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tên danh mục</label>
              <Input
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Slug (Tự động)</label>
              <Input
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSubmit}>
              {editingId ? "Lưu thay đổi" : "Tạo ngay"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
