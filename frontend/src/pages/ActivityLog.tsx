import { useState } from "react";
import { History, Search, Filter, RefreshCw, Calendar, ArrowRight } from "lucide-react";

export function ActivityLog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", label: "All Events" },
    { id: "invoices", label: "Invoices" },
    { id: "team", label: "Team & Access" },
    { id: "settings", label: "Settings" },
    { id: "integrations", label: "Integrations" },
    { id: "operational", label: "Operations" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 py-2">
      {/* Premium Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-56 h-56 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-semibold tracking-wide border border-indigo-500/30">
              <History className="h-3 w-3 mr-1" />
              Audit Logs
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              Global Activity Log
            </h1>
            <p className="text-sm md:text-base text-slate-300 max-w-2xl">
              Track administrative, user, settings, integration, and agent operations across your entire organization.
            </p>
          </div>
          
          <button className="flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white font-medium text-sm px-4 py-2.5 rounded-lg border border-white/20 shadow-sm backdrop-blur-md">
            <RefreshCw className="h-4 w-4 animate-spin-slow" />
            <span>Refresh Feed</span>
          </button>
        </div>
      </div>

      {/* Control bar / Filtering */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by actor name, email, description or entity ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all text-sm"
          />
        </div>

        {/* Date Filter Placeholder */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <button className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 text-left font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all text-sm flex items-center justify-between">
            <span>All Time</span>
            <Filter className="h-4 w-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide whitespace-nowrap transition-all duration-200 shadow-sm border ${
              selectedCategory === cat.id
                ? "bg-indigo-600 text-white border-indigo-600 scale-105 shadow-indigo-200"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Placeholder Feed List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Activity History</h2>
          <span className="text-xs text-slate-500">Showing page shell placeholder</span>
        </div>

        <div className="divide-y divide-slate-100">
          {/* Item 1 */}
          <div className="p-6 hover:bg-slate-50/50 transition-colors flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-indigo-50 flex-shrink-0 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100">
              U
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-900">Alice Admin invited Bob Member</div>
                <div className="text-xs text-slate-400">Just now</div>
              </div>
              <div className="text-sm text-slate-500">Category: Team & Access | Event: user.invited</div>
              <div className="flex items-center space-x-2 mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                  UI Source
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                  Role: admin
                </span>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-300 self-center" />
          </div>

          {/* Item 2 */}
          <div className="p-6 hover:bg-slate-50/50 transition-colors flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-emerald-50 flex-shrink-0 flex items-center justify-center text-emerald-600 font-bold border border-emerald-100">
              S
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-900">SendGrid connection enabled</div>
                <div className="text-xs text-slate-400">10 mins ago</div>
              </div>
              <div className="text-sm text-slate-500">Category: Integrations | Event: integration.connected</div>
              <div className="flex items-center space-x-2 mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                  System Source
                </span>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-300 self-center" />
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
          <div>Page 1 of 1</div>
          <div className="flex items-center space-x-2">
            <button disabled className="px-3 py-1 border border-slate-200 rounded-md bg-white text-slate-400 cursor-not-allowed text-xs font-medium">Previous</button>
            <button disabled className="px-3 py-1 border border-slate-200 rounded-md bg-white text-slate-400 cursor-not-allowed text-xs font-medium">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
