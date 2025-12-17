"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { productSchema, ProductFormData } from "@/lib/validations/product-schema"

interface ProductFormProps {
  initialData?: Partial<ProductFormData>
  onSubmit: (data: ProductFormData) => Promise<void>
  onCancel?: () => void
}

export function ProductForm({ initialData, onSubmit, onCancel }: ProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || {
      isActive: true,
      isFeatured: false,
      stock: 0,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="name">Ürün Adı *</label>
        <input
          id="name"
          type="text"
          {...register("name")}
        />
        {errors.name && <span>{errors.name.message}</span>}
      </div>

      <div>
        <label htmlFor="slug">Slug *</label>
        <input
          id="slug"
          type="text"
          {...register("slug")}
        />
        {errors.slug && <span>{errors.slug.message}</span>}
      </div>

      <div>
        <label htmlFor="description">Açıklama</label>
        <textarea
          id="description"
          {...register("description")}
          rows={4}
        />
        {errors.description && <span>{errors.description.message}</span>}
      </div>

      <div>
        <label htmlFor="price">Fiyat (TL) *</label>
        <input
          id="price"
          type="number"
          step="0.01"
          {...register("price", { valueAsNumber: true })}
        />
        {errors.price && <span>{errors.price.message}</span>}
      </div>

      <div>
        <label htmlFor="stock">Stok *</label>
        <input
          id="stock"
          type="number"
          {...register("stock", { valueAsNumber: true })}
        />
        {errors.stock && <span>{errors.stock.message}</span>}
      </div>

      <div>
        <label htmlFor="categoryId">Kategori *</label>
        <select id="categoryId" {...register("categoryId")}>
          <option value="">Kategori Seçiniz</option>
        </select>
        {errors.categoryId && <span>{errors.categoryId.message}</span>}
      </div>

      <div>
        <label htmlFor="brand">Marka</label>
        <input
          id="brand"
          type="text"
          {...register("brand")}
        />
      </div>

      <div>
        <label htmlFor="model">Model</label>
        <input
          id="model"
          type="text"
          {...register("model")}
        />
      </div>

      <div>
        <label htmlFor="material">Malzeme</label>
        <input
          id="material"
          type="text"
          {...register("material")}
        />
      </div>

      <div>
        <label htmlFor="diameter">Çap</label>
        <input
          id="diameter"
          type="text"
          {...register("diameter")}
        />
      </div>

      <div>
        <label htmlFor="pressure">Basınç</label>
        <input
          id="pressure"
          type="text"
          {...register("pressure")}
        />
      </div>

      <div>
        <label htmlFor="flowRate">Akış Hızı</label>
        <input
          id="flowRate"
          type="text"
          {...register("flowRate")}
        />
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            {...register("isActive")}
          />
          {" "}Aktif
        </label>
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            {...register("isFeatured")}
          />
          {" "}Öne Çıkan
        </label>
      </div>

      <div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel}>
            İptal
          </button>
        )}
      </div>
    </form>
  )
}
