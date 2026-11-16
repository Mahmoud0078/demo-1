import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Home,
  Car,
  Wallet,
  User,
  MapPin,
  Clock,
  Star,
  ArrowRight,
  Navigation,
  ShieldCheck,
  Plus,
  Minus,
  CheckCircle2,
  Loader2,
  Phone,
  X,
} from "lucide-react";

type Tab = "home" | "rides" | "wallet" | "profile";

type Ride = {
  id: string;
  from: string;
  to: string;
  driver: string;
  price: number;
  status: "completed" | "active";
  when: string;
  rating: number;
};

const INITIAL_RIDES: Ride[] = [
  {
    id: "r1",
    from: "المعادي",
    to: "وسط البلد",
    driver: "أحمد سامي",
    price: 42,
    status: "completed",
    when: "أمس · 6:40 م",
    rating: 5,
  },
  {
    id: "r2",
    from: "مدينة نصر",
    to: "مطار القاهرة",
    driver: "محمود ع.",
    price: 118,
    status: "completed",
    when: "الثلاثاء · 9:15 ص",
    rating: 4,
  },
  {
    id: "r3",
    from: "الزمالك",
    to: "الشيخ زايد",
    driver: "كريم ف.",
    price: 76,
    status: "completed",
    when: "الاثنين · 8:05 م",
    rating: 5,
  },
];

const PLACES = ["المعادي", "وسط البلد", "مدينة نصر", "الزمالك", "الشيخ زايد", "مطار القاهرة"];

const STORAGE_KEY = "meshwar_state_v1";

type Persisted = {
  balance: number;
  rides: Ride[];
};

function loadState(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { balance: 340, rides: INITIAL_RIDES };
    const parsed = JSON.parse(raw) as Persisted;
    if (typeof parsed.balance !== "number" || !Array.isArray(parsed.rides)) {
      return { balance: 340, rides: INITIAL_RIDES };
    }
    return parsed;
  } catch {
    return { balance: 340, rides: INITIAL_RIDES };
  }
}

function formatEgp(n: number) {
  return `${n.toLocaleString("ar-EG")} ج.م`;
}

export default function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [balance, setBalance] = useState(340);
  const [rides, setRides] = useState<Ride[]>(INITIAL_RIDES);
  const [from, setFrom] = useState("المعادي");
  const [to, setTo] = useState("وسط البلد");
  const [requesting, setRequesting] = useState(false);
  const [activeRide, setActiveRide] = useState<Ride | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Restore persisted state on mount
  useEffect(() => {
    const s = loadState();
    setBalance(s.balance);
    setRides(s.rides);
    setHydrated(true);
  }, []);

  // Persist on change
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ balance, rides }));
    } catch {
      /* storage unavailable — ignore */
    }
  }, [balance, rides, hydrated]);

  const fare = useMemo(() => {
    if (from === to) return 0;
    const seed = (from.length * 7 + to.length * 13) % 40;
    return 35 + seed;
  }, [from, to]);

  useEffect(() => {
    if (!requesting) return;
    const t = setTimeout(() => {
      const ride: Ride = {
        id: `r${Date.now()}`,
        from,
        to,
        driver: "مصطفى ح.",
        price: fare,
        status: "active",
        when: "الآن",
        rating: 0,
      };
      setActiveRide(ride);
      setRequesting(false);
    }, 1400);
    return () => clearTimeout(t);
  }, [requesting, from, to, fare]);

  function completeRide() {
    if (!activeRide) return;
    setRides((prev) => [{ ...activeRide, status: "completed", rating: 5 }, ...prev]);
    setBalance((b) => Math.max(0, b - activeRide.price));
    setActiveRide(null);
    setTab("rides");
  }

  function cancelRide() {
    setActiveRide(null);
  }

  const totalSpent = rides.reduce((s, r) => s + r.price, 0);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-md flex-col bg-slate-50 shadow-xl">
        {/* Header */}
        <header className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 px-5 pb-8 pt-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 backdrop-blur">
                <Car className="h-5 w-5" />
              </div>
              <span className="font-serif text-lg font-bold tracking-tight">مشوار</span>
            </div>
            <Badge className="border-0 bg-white/15 text-white hover:bg-white/20">
              <ShieldCheck className="ml-1 h-3 w-3" /> موثّق
            </Badge>
          </div>

          <div className="mt-6">
            <p className="text-xs text-emerald-100/80">الرصيد المتاح</p>
            <p className="mt-1 text-3xl font-bold">
              {hydrated ? formatEgp(balance) : "—"}
            </p>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 space-y-5 px-5 pb-28 pt-5">
          {tab === "home" && (
            <>
              {activeRide ? (
                <Card className="border-emerald-200 bg-emerald-50 shadow-sm">
                  <CardContent className="space-y-4 p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-emerald-800">
                        رحلتك جارية
                      </span>
                      <Badge className="border-0 bg-emerald-600 text-white">نشطة</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-emerald-600" />
                        <span>{activeRide.from}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Navigation className="h-4 w-4 text-emerald-600" />
                        <span>{activeRide.to}</span>
                      </div>
                    </div>
                    <Separator className="bg-emerald-200" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-emerald-800">الكابتن {activeRide.driver}</span>
                      <span className="font-bold">{formatEgp(activeRide.price)}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={completeRide}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      >
                        <CheckCircle2 className="ml-2 h-4 w-4" /> إنهاء الرحلة
                      </Button>
                      <Button
                        variant="outline"
                        onClick={cancelRide}
                        className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full text-emerald-700 hover:bg-emerald-100"
                    >
                      <Phone className="ml-2 h-4 w-4" /> اتصل بالكابتن
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="shadow-sm">
                  <CardContent className="space-y-4 p-5">
                    <h2 className="font-serif text-lg font-bold">اطلب مشوار</h2>

                    <div className="space-y-3">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-500">
                          من
                        </label>
                        <select
                          value={from}
                          onChange={(e) => setFrom(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                        >
                          {PLACES.map((p) => (
                            <option key={p}>{p}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-500">
                          إلى
                        </label>
                        <select
                          value={to}
                          onChange={(e) => setTo(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                        >
                          {PLACES.map((p) => (
                            <option key={p}>{p}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                      <span className="text-sm text-slate-500">السعر التقديري</span>
                      <span className="text-lg font-bold text-emerald-700">
                        {from === to ? "—" : formatEgp(fare)}
                      </span>
                    </div>

                    <Button
                      disabled={from === to || requesting}
                      onClick={() => setRequesting(true)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                    >
                      {requesting ? (
                        <>
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                          جاري البحث عن كابتن...
                        </>
                      ) : (
                        <>
                          اطلب الآن
                          <ArrowRight className="mr-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Card className="shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-xs text-slate-500">إجمالي المشاوير</p>
                    <p className="mt-1 text-2xl font-bold">{rides.length}</p>
                  </CardContent>
                </Card>
                <Card className="shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-xs text-slate-500">إجمالي المصروف</p>
                    <p className="mt-1 text-2xl font-bold text-emerald-700">
                      {formatEgp(totalSpent)}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {tab === "rides" && (
            <div className="space-y-3">
              <h2 className="font-serif text-lg font-bold">سجل المشاوير</h2>
              {rides.length === 0 ? (
                <Card className="shadow-sm">
                  <CardContent className="flex flex-col items-center gap-2 p-8 text-center">
                    <Car className="h-8 w-8 text-slate-300" />
                    <p className="text-sm text-slate-500">لا توجد مشاوير بعد</p>
                  </CardContent>
                </Card>
              ) : (
                rides.map((r) => (
                  <Card key={r.id} className="shadow-sm">
                    <CardContent className="space-y-3 p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-emerald-600" />
                            <span>{r.from}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Navigation className="h-4 w-4 text-emerald-600" />
                            <span>{r.to}</span>
                          </div>
                        </div>
                        <span className="font-bold">{formatEgp(r.price)}</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {r.when}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {r.rating}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {tab === "wallet" && (
            <div className="space-y-4">
              <Card className="border-0 bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-md">
                <CardContent className="p-5">
                  <p className="text-xs text-emerald-100/80">المحفظة</p>
                  <p className="mt-1 text-3xl font-bold">{formatEgp(balance)}</p>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button
                  onClick={() => setBalance((b) => b + 100)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  <Plus className="ml-2 h-4 w-4" /> إضافة 100
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setBalance((b) => Math.max(0, b - 100))}
                  className="flex-1"
                >
                  <Minus className="ml-2 h-4 w-4" /> سحب 100
                </Button>
              </div>

              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <p className="mb-2 text-sm font-semibold">أحدث العمليات</p>
                  {rides.length === 0 ? (
                    <p className="py-4 text-center text-sm text-slate-400">لا توجد عمليات</p>
                  ) : (
                    <div className="space-y-3">
                      {rides.slice(0, 4).map((r) => (
                        <div key={r.id} className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">{r.to}</span>
                          <span className="font-medium text-rose-600">
                            -{formatEgp(r.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {tab === "profile" && (
            <div className="space-y-4">
              <Card className="shadow-sm">
                <CardContent className="flex items-center gap-4 p-5">
                  <Avatar className="h-14 w-14">
                    <AvatarFallback className="bg-emerald-100 text-emerald-700">
                      م.ع
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold">محمد عبد الله</p>
                    <p className="text-xs text-slate-500">عضو منذ 2023</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="space-y-4 p-5">
                  <div>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-slate-500">تقييمك</span>
                      <span className="font-semibold">4.9</span>
                    </div>
                    <Progress value={98} className="h-2" />
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-slate-500">الرحلات المكتملة</span>
                      <span className="font-semibold">{rides.length}</span>
                    </div>
                    <Progress value={Math.min(100, rides.length * 10)} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>

        {/* Bottom nav */}
        <nav className="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
          <div className="grid grid-cols-4">
            {(
              [
                { id: "home", label: "الرئيسية", icon: Home },
                { id: "rides", label: "المشاوير", icon: Car },
                { id: "wallet", label: "المحفظة", icon: Wallet },
                { id: "profile", label: "حسابي", icon: User },
              ] as const
            ).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={cn(
                  "flex flex-col items-center gap-1 py-3 text-xs transition-colors",
                  tab === id ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <Icon className={cn("h-5 w-5", tab === id && "stroke-2")} />
                {label}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}