import "../globals.css";
import { PageBackground } from "@/components/page-background";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import type { ReactNode } from "react";

export default function SiteLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <>
      <PageBackground />
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}
