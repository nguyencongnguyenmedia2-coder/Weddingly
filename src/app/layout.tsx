import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://weddingly.vn"),
  title: {
    default: "Weddingly – Cưới thông minh, Tài chính an tâm | Nền tảng Quản lý Đám cưới Toàn diện",
    template: "%s | Weddingly",
  },
  description:
    "Weddingly không chỉ là app ghi chép tiền mừng mà là Nền tảng quản lý đám cưới thông minh toàn diện cho các cặp đôi Việt Nam: Dự toán ngân sách, RSVP trực tuyến, Sơ đồ bàn tiệc, Kịch bản ngày cưới và Trợ lý AI thông minh Emma.",
  keywords: [
    "Weddingly",
    "cưới thông minh",
    "tài chính an tâm",
    "kế hoạch đám cưới",
    "quản lý đám cưới",
    "dự toán chi phí cưới",
    "ghi chép tiền mừng",
    "quản lý tiền mừng cưới",
    "rsvp online",
    "thiệp cưới điện tử",
    "sơ đồ bàn tiệc cưới",
    "timeline ngày cưới",
    "wedding planner việt nam",
    "lập kế hoạch cưới",
  ],
  authors: [{ name: "Weddingly Team" }],
  creator: "Weddingly",
  publisher: "Weddingly",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Weddingly – Cưới thông minh, Tài chính an tâm",
    description:
      "Weddingly không chỉ là app ghi chép tiền mừng mà là Nền tảng quản lý đám cưới thông minh toàn diện cho các cặp đôi Việt Nam.",
    url: "/",
    siteName: "Weddingly",
    images: [
      {
        url: "/og-image.jpg",
        width: 1024,
        height: 1024,
        alt: "Weddingly – Cưới thông minh, Tài chính an tâm",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Weddingly – Cưới thông minh, Tài chính an tâm",
    description:
      "Nền tảng quản lý đám cưới thông minh toàn diện cho các cặp đôi Việt Nam.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#8B5E5A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "Weddingly",
      "operatingSystem": "Web, iOS, Android",
      "applicationCategory": "LifestyleApplication, BusinessApplication",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "ratingCount": "1280"
      },
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "VND"
      },
      "description": "Nền tảng quản lý đám cưới thông minh toàn diện cho các cặp đôi Việt Nam: Dự toán ngân sách, RSVP trực tuyến, Sơ đồ bàn tiệc, Kịch bản ngày cưới & Trợ lý Emma AI."
    },
    {
      "@type": "Organization",
      "name": "Weddingly",
      "url": "https://weddingly.vn",
      "logo": "https://weddingly.vn/logo.png",
      "slogan": "Cưới thông minh – Tài chính an tâm",
      "description": "Nền tảng quản lý đám cưới thông minh toàn diện cho các cặp đôi Việt Nam."
    }
  ]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased flex flex-col font-sans selection:bg-[#D6BE91] selection:text-[#2C2422]">
        {children}
      </body>
    </html>
  );
}
