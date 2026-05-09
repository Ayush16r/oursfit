"use client";

import { Percent, Megaphone, Zap } from "lucide-react";

export default function AdminMarketingPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold uppercase tracking-tighter mb-2">Marketing</h1>
        <p className="text-sm opacity-70 uppercase tracking-widest">Run campaigns, flash sales, and announcements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Flash Sales Card */}
        <div className="glass-panel p-6 rounded-xl border border-border/50 relative overflow-hidden group hover:border-accent/50 transition-colors cursor-pointer">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl group-hover:bg-accent/20 transition-colors"></div>
          <Zap className="w-8 h-8 text-accent mb-4 relative z-10" />
          <h2 className="text-xl font-bold uppercase tracking-tighter mb-2 relative z-10">Flash Sales</h2>
          <p className="text-sm text-muted-foreground mb-4 relative z-10">
            Create limited-time drops with countdown timers to generate hype.
          </p>
          <button className="btn-outline w-full relative z-10 text-xs">Configure Drop</button>
        </div>

        {/* Announcement Bar */}
        <div className="glass-panel p-6 rounded-xl border border-border/50 relative overflow-hidden group hover:border-blue-500/50 transition-colors cursor-pointer">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors"></div>
          <Megaphone className="w-8 h-8 text-blue-500 mb-4 relative z-10" />
          <h2 className="text-xl font-bold uppercase tracking-tighter mb-2 relative z-10">Announcements</h2>
          <p className="text-sm text-muted-foreground mb-4 relative z-10">
            Update the top scrolling marquee banner on the storefront.
          </p>
          <button className="btn-outline w-full relative z-10 text-xs hover:border-blue-500 hover:text-blue-500">Edit Banner</button>
        </div>

        {/* Featured Collections */}
        <div className="glass-panel p-6 rounded-xl border border-border/50 relative overflow-hidden group hover:border-purple-500/50 transition-colors cursor-pointer">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-colors"></div>
          <Percent className="w-8 h-8 text-purple-500 mb-4 relative z-10" />
          <h2 className="text-xl font-bold uppercase tracking-tighter mb-2 relative z-10">Campaigns</h2>
          <p className="text-sm text-muted-foreground mb-4 relative z-10">
            Group products into featured collections for seasonal sales.
          </p>
          <button className="btn-outline w-full relative z-10 text-xs hover:border-purple-500 hover:text-purple-500">Manage Campaigns</button>
        </div>
      </div>
    </div>
  );
}
