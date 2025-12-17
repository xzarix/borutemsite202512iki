import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting seed...")

  // Create categories (irrigation equipment categories)
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "damla-sulama" },
      update: {},
      create: {
        name: "Damla Sulama Sistemleri",
        slug: "damla-sulama",
        description: "Ekonomik su kullanımı için damla sulama ekipmanları",
        image: "/images/categories/damla-sulama.jpg",
      },
    }),
    prisma.category.upsert({
      where: { slug: "yagmurlama-sulama" },
      update: {},
      create: {
        name: "Yağmurlama Sistemleri",
        slug: "yagmurlama-sulama",
        description: "Geniş alanlar için yağmurlama sulama sistemleri",
        image: "/images/categories/yagmurlama.jpg",
      },
    }),
    prisma.category.upsert({
      where: { slug: "borular-ve-baglanti" },
      update: {},
      create: {
        name: "Borular ve Bağlantı Elemanları",
        slug: "borular-ve-baglanti",
        description: "PE borular, PVC borular ve bağlantı parçaları",
        image: "/images/categories/borular.jpg",
      },
    }),
    prisma.category.upsert({
      where: { slug: "pompalar" },
      update: {},
      create: {
        name: "Pompalar ve Pompa Sistemleri",
        slug: "pompalar",
        description: "Dalgıç, santrifüj ve derin kuyu pompaları",
        image: "/images/categories/pompalar.jpg",
      },
    }),
    prisma.category.upsert({
      where: { slug: "filtreler" },
      update: {},
      create: {
        name: "Filtreler ve Filtrasyon",
        slug: "filtreler",
        description: "Kum filtreleri, disk filtreleri ve otomat filtreler",
        image: "/images/categories/filtreler.jpg",
      },
    }),
    prisma.category.upsert({
      where: { slug: "gubreleme-sistemleri" },
      update: {},
      create: {
        name: "Gübreleme Sistemleri",
        slug: "gubreleme-sistemleri",
        description: "Venturi, enjektör ve gübre tankları",
        image: "/images/categories/gubreleme.jpg",
      },
    }),
    prisma.category.upsert({
      where: { slug: "vana-ve-kontrol" },
      update: {},
      create: {
        name: "Vana ve Kontrol Sistemleri",
        slug: "vana-ve-kontrol",
        description: "Selenoid vanalar, basınç düzenleyiciler, kontrol üniteleri",
        image: "/images/categories/vanalar.jpg",
      },
    }),
  ])

  console.log("Categories created:", categories.length)

  // Create products
  const products = await Promise.all([
    // Damla Sulama Products
    prisma.product.upsert({
      where: { slug: "damla-sulama-hortumu-16mm" },
      update: {},
      create: {
        name: "Damla Sulama Hortumu 16mm - 30cm Aralıklı",
        slug: "damla-sulama-hortumu-16mm",
        description: "Yüksek kaliteli LDPE malzemeden üretilmiş, 30cm aralıklı damlatıcılı sulama hortumu",
        price: 1250.00,
        stock: 5000,
        categoryId: categories[0].id,
        brand: "Netafim",
        model: "UniRam",
        material: "LDPE",
        diameter: "16mm",
        pressure: "1-3 bar",
        flowRate: "2 L/saat",
        images: ["/images/products/damla-hortum-16mm.jpg"],
        isActive: true,
        isFeatured: true,
      },
    }),
    prisma.product.upsert({
      where: { slug: "damla-sulama-hortumu-20mm" },
      update: {},
      create: {
        name: "Damla Sulama Hortumu 20mm - 40cm Aralıklı",
        slug: "damla-sulama-hortumu-20mm",
        description: "Dayanıklı PE malzeme, uzun ömürlü, 40cm aralıklı damlatıcılı hortum",
        price: 1450.00,
        stock: 3500,
        categoryId: categories[0].id,
        brand: "Rivulis",
        model: "T-Tape",
        material: "PE",
        diameter: "20mm",
        pressure: "0.5-2 bar",
        flowRate: "2.5 L/saat",
        images: ["/images/products/damla-hortum-20mm.jpg"],
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { slug: "ayarli-damlatici-4lh" },
      update: {},
      create: {
        name: "Ayarlı Damlatıcı 4 L/saat",
        slug: "ayarli-damlatici-4lh",
        description: "Basınç kompanzasyonlu, tıkanmaya karşı dirençli ayarlı damlatıcı",
        price: 2.50,
        stock: 50000,
        categoryId: categories[0].id,
        brand: "Rain Bird",
        model: "XFD-04",
        material: "Plastik",
        flowRate: "4 L/saat",
        pressure: "1-4 bar",
        images: ["/images/products/damlatici-4l.jpg"],
        isActive: true,
        isFeatured: true,
      },
    }),

    // Yağmurlama Products
    prisma.product.upsert({
      where: { slug: "rotator-sprinkler" },
      update: {},
      create: {
        name: "Rotatör Sprinkler 360° - 15m Menzil",
        slug: "rotator-sprinkler",
        description: "360 derece döner başlıklı, ayarlanabilir menzilinli yağmurlama başlığı",
        price: 85.00,
        stock: 2000,
        categoryId: categories[1].id,
        brand: "Hunter",
        model: "MP Rotator 3000",
        material: "ABS Plastik",
        flowRate: "12-18 L/dk",
        pressure: "2-4 bar",
        images: ["/images/products/rotator-sprinkler.jpg"],
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { slug: "yagmurlama-tabancasi" },
      update: {},
      create: {
        name: "Yağmurlama Tabancası - Ayarlanabilir",
        slug: "yagmurlama-tabancasi",
        description: "Profesyonel metal gövdeli, ayarlanabilir açılı yağmurlama tabancası",
        price: 350.00,
        stock: 800,
        categoryId: categories[1].id,
        brand: "Komet",
        model: "Bravo 93",
        material: "Pirinç + Plastik",
        flowRate: "20-60 L/dk",
        pressure: "2-6 bar",
        images: ["/images/products/yagmurlama-tabanca.jpg"],
        isActive: true,
        isFeatured: true,
      },
    }),

    // Borular
    prisma.product.upsert({
      where: { slug: "pe-boru-32mm" },
      update: {},
      create: {
        name: "PE Boru 32mm - PN6 - 100m",
        slug: "pe-boru-32mm",
        description: "Yüksek yoğunluklu polietilen ana hat borusu, 100 metre rulo",
        price: 2800.00,
        stock: 500,
        categoryId: categories[2].id,
        brand: "Dizayn",
        model: "HDPE PN6",
        material: "HDPE",
        diameter: "32mm",
        pressure: "6 bar",
        images: ["/images/products/pe-boru-32mm.jpg"],
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { slug: "pe-boru-63mm" },
      update: {},
      create: {
        name: "PE Boru 63mm - PN10 - 100m",
        slug: "pe-boru-63mm",
        description: "Yüksek basınçlı PE ana hat borusu, 100 metre rulo",
        price: 7500.00,
        stock: 300,
        categoryId: categories[2].id,
        brand: "Pimtaş",
        model: "HDPE PN10",
        material: "HDPE",
        diameter: "63mm",
        pressure: "10 bar",
        images: ["/images/products/pe-boru-63mm.jpg"],
        isActive: true,
        isFeatured: true,
      },
    }),

    // Pompalar
    prisma.product.upsert({
      where: { slug: "dalgic-pompa-1hp" },
      update: {},
      create: {
        name: "Dalgıç Pompa 1 HP - Paslanmaz",
        slug: "dalgic-pompa-1hp",
        description: "Paslanmaz çelik gövdeli, uzun ömürlü dalgıç pompa",
        price: 4500.00,
        stock: 150,
        categoryId: categories[3].id,
        brand: "Pedrollo",
        model: "4SR",
        material: "Paslanmaz Çelik",
        flowRate: "120 L/dk",
        pressure: "5 bar",
        images: ["/images/products/dalgic-1hp.jpg"],
        isActive: true,
        isFeatured: true,
      },
    }),
    prisma.product.upsert({
      where: { slug: "santrifuj-pompa-3hp" },
      update: {},
      create: {
        name: "Santrifüj Pompa 3 HP",
        slug: "santrifuj-pompa-3hp",
        description: "Yüzey montaj santrifüj pompa, tarımsal sulama için ideal",
        price: 6800.00,
        stock: 80,
        categoryId: categories[3].id,
        brand: "Speroni",
        model: "CM 32",
        material: "Döküm Gövde",
        flowRate: "240 L/dk",
        pressure: "4 bar",
        images: ["/images/products/santrifuj-3hp.jpg"],
        isActive: true,
      },
    }),

    // Filtreler
    prisma.product.upsert({
      where: { slug: "disk-filtre-2-inch" },
      update: {},
      create: {
        name: "Disk Filtre 2\" - 120 Mesh",
        slug: "disk-filtre-2-inch",
        description: "Otomatik yıkamalı disk filtre, 120 mesh filtrasyon",
        price: 1850.00,
        stock: 200,
        categoryId: categories[4].id,
        brand: "Amiad",
        model: "Sigma",
        material: "Plastik Gövde",
        diameter: "2 inch",
        flowRate: "15 m³/saat",
        images: ["/images/products/disk-filtre-2.jpg"],
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { slug: "kum-filtre-media" },
      update: {},
      create: {
        name: "Kum Filtre 24\" - Media Tankı",
        slug: "kum-filtre-media",
        description: "Yüksek kapasiteli kum filtre tankı, kum ve çakıl dahil",
        price: 8500.00,
        stock: 50,
        categoryId: categories[4].id,
        brand: "Netafim",
        model: "Media Filter",
        material: "Fiberglass Tank",
        diameter: "24 inch",
        flowRate: "25 m³/saat",
        images: ["/images/products/kum-filtre.jpg"],
        isActive: true,
        isFeatured: true,
      },
    }),

    // Gübreleme
    prisma.product.upsert({
      where: { slug: "venturi-enjektoru-1-inch" },
      update: {},
      create: {
        name: "Venturi Enjektörü 1\"",
        slug: "venturi-enjektoru-1-inch",
        description: "Basınç farkı ile çalışan gübre enjeksiyon sistemi",
        price: 450.00,
        stock: 400,
        categoryId: categories[5].id,
        brand: "Mazzei",
        model: "1\" Venturi",
        material: "PVC",
        diameter: "1 inch",
        flowRate: "8 L/dk",
        images: ["/images/products/venturi-1.jpg"],
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { slug: "gubre-tanki-100lt" },
      update: {},
      create: {
        name: "Gübre Tankı 100 Litre - Basınçlı",
        slug: "gubre-tanki-100lt",
        description: "Basınçlı gübre enjeksiyon tankı, ayarlanabilir enjeksiyon oranı",
        price: 3200.00,
        stock: 120,
        categoryId: categories[5].id,
        brand: "Dosatron",
        model: "100L Tank",
        material: "Polietilen",
        pressure: "6 bar",
        images: ["/images/products/gubre-tank-100.jpg"],
        isActive: true,
      },
    }),

    // Vanalar
    prisma.product.upsert({
      where: { slug: "selenoid-vana-1-inch" },
      update: {},
      create: {
        name: "Selenoid Vana 1\" - 24V AC",
        slug: "selenoid-vana-1-inch",
        description: "Otomasyona uygun elektrikli selenoid vana, 24V AC",
        price: 650.00,
        stock: 350,
        categoryId: categories[6].id,
        brand: "Rain Bird",
        model: "100-DV",
        material: "Plastik Gövde",
        diameter: "1 inch",
        pressure: "10 bar",
        images: ["/images/products/selenoid-1.jpg"],
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { slug: "basinc-duzenleyici" },
      update: {},
      create: {
        name: "Basınç Düzenleyici 2 Bar - 1\"",
        slug: "basinc-duzenleyici",
        description: "Sabit çıkış basıncı sağlayan düzenleyici vana, 2 bar ayarlı",
        price: 280.00,
        stock: 600,
        categoryId: categories[6].id,
        brand: "Senninger",
        model: "PSR-2",
        material: "Plastik",
        diameter: "1 inch",
        pressure: "2 bar çıkış",
        images: ["/images/products/basinc-duzenleyici.jpg"],
        isActive: true,
        isFeatured: true,
      },
    }),
  ])

  console.log("Products created:", products.length)

  // Create a test dealer
  const hashedPassword = await bcrypt.hash("test123", 10)
  const testDealer = await prisma.dealer.upsert({
    where: { email: "test@borutem.com" },
    update: {},
    create: {
      email: "test@borutem.com",
      password: hashedPassword,
      companyName: "Test Tarım Ltd. Şti.",
      contactName: "Ahmet Yılmaz",
      phone: "05321234567",
      address: "Organize Sanayi Bölgesi, 1. Cadde No: 45",
      city: "Antalya",
      taxNumber: "1234567890",
      isApproved: true,
      isActive: true,
      priceTier: "GOLD",
      creditLimit: 50000,
    },
  })

  console.log("Test dealer created:", testDealer.email)

  // Create technical specifications for some products
  await prisma.technicalSpecification.createMany({
    data: [
      {
        productId: products[0].id,
        key: "Uzunluk",
        value: "100",
        unit: "metre",
        category: "Boyutlar",
        order: 1,
      },
      {
        productId: products[0].id,
        key: "Damlatıcı Aralığı",
        value: "30",
        unit: "cm",
        category: "Teknik",
        order: 2,
      },
      {
        productId: products[0].id,
        key: "Çalışma Basıncı",
        value: "1-3",
        unit: "bar",
        category: "Teknik",
        order: 3,
      },
      {
        productId: products[7].id,
        key: "Güç",
        value: "1",
        unit: "HP",
        category: "Motor",
        order: 1,
      },
      {
        productId: products[7].id,
        key: "Maksimum Debi",
        value: "120",
        unit: "L/dk",
        category: "Performans",
        order: 2,
      },
      {
        productId: products[7].id,
        key: "Maksimum Basma Yüksekliği",
        value: "50",
        unit: "metre",
        category: "Performans",
        order: 3,
      },
    ],
  })

  console.log("Technical specifications created")

  console.log("Seed completed successfully!")
}

main()
  .catch((e) => {
    console.error("Seed error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
