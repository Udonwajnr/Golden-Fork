import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { ChatWidget } from "@/components/site/chat-widget";

export default function SiteLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-gf-bg">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <ChatWidget />
    </div>
  );
}