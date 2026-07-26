import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarDays,
  Images,
  Mail,
  MessageSquareQuote,
  Plus,
  Sparkles,
  Tag,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ContactMessage } from "@/data/contact";
import type { GalleryItem } from "@/data/gallery";
import type { PricingPlan } from "@/data/pricing";
import type { Review } from "@/data/reviews";
import {
  getCmsGallery,
  getCmsMessages,
  getCmsPricing,
  getCmsReviews,
} from "@/lib/cms-store";

export const Route = createFileRoute("/")({
  component: AdminDashboard,
});

const publishTrend = [
  { day: "Mon", reviews: 2, gallery: 1 },
  { day: "Tue", reviews: 1, gallery: 3 },
  { day: "Wed", reviews: 3, gallery: 2 },
  { day: "Thu", reviews: 2, gallery: 4 },
  { day: "Fri", reviews: 4, gallery: 2 },
  { day: "Sat", reviews: 1, gallery: 1 },
  { day: "Sun", reviews: 2, gallery: 3 },
];

const activity = [
  { id: 1, text: "Review “Amina Rahman” marked featured", time: "2 minutes ago", tone: "bg-blue-100 text-blue-600" },
  { id: 2, text: "Gallery item “Outbound war room” published", time: "18 minutes ago", tone: "bg-emerald-100 text-emerald-600" },
  { id: 3, text: "New video review uploaded (Jordan Lee)", time: "1 hour ago", tone: "bg-violet-100 text-violet-600" },
  { id: 4, text: "Media library: 3 assets synced", time: "3 hours ago", tone: "bg-orange-100 text-orange-600" },
  { id: 5, text: "Team profile “Safiq Ahmed” updated", time: "Yesterday", tone: "bg-slate-100 text-slate-600" },
];

function AdminDashboard() {
  const { user } = useAdminAuth();
  const firstName = user?.name.split(" ")[0] ?? "there";
  const [reviews, setReviews] = useState<Review[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [plans, setPlans] = useState<PricingPlan[]>([]);

  useEffect(() => {
    void Promise.all([
      getCmsReviews(),
      getCmsGallery(),
      getCmsMessages().catch(() => [] as ContactMessage[]),
      getCmsPricing().catch(() => [] as PricingPlan[]),
    ])
      .then(([r, g, m, p]) => {
        setReviews(r);
        setGalleryItems(g);
        setMessages(m);
        setPlans(p);
      })
      .catch((e) => console.error(e));
  }, []);

  const publishedGallery = galleryItems.filter((g) => g.published).length;
  const featuredReviews = reviews.filter((r) => r.featured).length;
  const unreadMessages = messages.filter((m) => !m.read).length;
  const livePlans = plans.filter((p) => p.published).length;

  const contentMix = useMemo(
    () => [
      { name: "Text reviews", value: reviews.filter((r) => r.type === "text").length, color: "#0061FF" },
      { name: "Video reviews", value: reviews.filter((r) => r.type === "video").length, color: "#16A34A" },
      { name: "Image reviews", value: reviews.filter((r) => r.type === "image").length, color: "#EA580C" },
      { name: "Gallery photos", value: galleryItems.filter((g) => g.type === "photo").length, color: "#7C3AED" },
    ],
    [reviews, galleryItems],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Welcome back, {firstName} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            A quick look at your website content.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-[12px] border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
          <CalendarDays className="h-4 w-4 text-[#0061FF]" />
          This week
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          title="Reviews"
          value={String(reviews.length)}
          hint={
            featuredReviews
              ? `${featuredReviews} shown on homepage`
              : "Customer reviews on your site"
          }
          icon={MessageSquareQuote}
          tone="blue"
        />
        <AdminStatCard
          title="Gallery"
          value={String(galleryItems.length)}
          hint={
            publishedGallery
              ? `${publishedGallery} photos & videos live`
              : "Photos & videos"
          }
          icon={Images}
          tone="purple"
        />
        <AdminStatCard
          title="Messages"
          value={String(messages.length)}
          hint={
            unreadMessages
              ? `${unreadMessages} new from contact form`
              : "From website visitors"
          }
          icon={Mail}
          tone="green"
        />
        <AdminStatCard
          title="Pricing plans"
          value={String(plans.length)}
          hint={
            livePlans
              ? `${livePlans} visible on website`
              : "Packages on your site"
          }
          icon={Tag}
          tone="orange"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="rounded-[12px] border border-slate-200/70 bg-white p-5 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.28)] xl:col-span-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-slate-900">Publishing overview</h2>
              <p className="text-sm text-slate-500">Reviews & gallery activity this week</p>
            </div>
            <Badge variant="secondary" className="rounded-[12px] bg-slate-100 text-slate-600">
              Last 7 days
            </Badge>
          </div>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={publishTrend}>
                <defs>
                  <linearGradient id="reviewsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0061FF" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#0061FF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="galleryFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#16A34A" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#16A34A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#94A3B8", fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#94A3B8", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
                  }}
                />
                <Area type="monotone" dataKey="reviews" name="Reviews" stroke="#0061FF" fill="url(#reviewsFill)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="gallery" name="Gallery" stroke="#16A34A" fill="url(#galleryFill)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[12px] border border-slate-200/70 bg-white p-5 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.28)] xl:col-span-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Recent content</h2>
            <Link to="/reviews" className="text-sm font-medium text-[#0061FF] hover:underline">
              View all
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {reviews.slice(0, 5).map((r) => (
              <li
                key={r.id}
                className="flex items-center gap-3 rounded-[12px] border border-slate-100 bg-slate-50/50 px-3 py-2.5 transition hover:border-[#0061FF]/25 hover:bg-[#F4F8FF]"
              >
                <ProfileAvatar name={r.name} src={r.avatar} className="h-9 w-9" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-slate-900">{r.name}</div>
                  <div className="text-xs capitalize text-slate-500">{r.type} review</div>
                </div>
                {r.featured && (
                  <Badge className="rounded-[12px] bg-[#E8F0FF] text-[10px] text-[#0061FF] hover:bg-[#E8F0FF]">
                    Featured
                  </Badge>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="rounded-[12px] border border-slate-200/70 bg-white p-5 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.28)] lg:col-span-7">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Recent activity</h2>
            <Sparkles className="h-4 w-4 text-[#0061FF]" />
          </div>
          <ul className="mt-4 divide-y divide-slate-100">
            {activity.map((item) => (
              <li key={item.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[12px] text-xs font-bold ${item.tone}`}>
                  ·
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-700">{item.text}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{item.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[12px] border border-slate-200/70 bg-white p-5 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.28)] lg:col-span-5">
          <h2 className="font-semibold text-slate-900">Content mix</h2>
          <p className="text-sm text-slate-500">What your site is made of</p>
          <div className="mt-2 flex items-center gap-4">
            <div className="h-44 w-44 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={contentMix}
                    dataKey="value"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={3}
                  >
                    {contentMix.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="space-y-2.5">
              {contentMix.map((item) => (
                <li key={item.name} className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-[12px]" style={{ background: item.color }} />
                  <span className="flex-1">{item.name}</span>
                  <span className="font-semibold text-slate-900">{item.value}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild className="rounded-[12px] bg-[#0061FF] hover:bg-[#0052D6]">
              <Link to="/reviews">
                <Plus className="mr-1.5 h-4 w-4" /> Add review
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-[12px]">
              <Link to="/gallery">Manage gallery</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
