import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BarChart3,
    Building2,
    Calculator,
    CheckCircle2,
    LayoutDashboard,
    Moon,
    SlidersHorizontal,
    Sparkles,
    Sun,
    Table2,
    Trophy,
} from 'lucide-react';
import type { ComponentType } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAppearance } from '@/hooks/use-appearance';
import { dashboard, login, register } from '@/routes';

function Logo() {
    return (
        <>
            <img
                src="/logo-lightmode.svg"
                alt="KosRank"
                className="block h-8 w-auto dark:hidden"
            />
            <img
                src="/logo-darkmode.svg"
                alt="KosRank"
                className="hidden h-8 w-auto dark:block"
            />
        </>
    );
}

function ThemeToggle() {
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const isDark = resolvedAppearance === 'dark';

    return (
        <Button
            variant="ghost"
            size="icon"
            aria-label="Ganti tema"
            onClick={() => updateAppearance(isDark ? 'light' : 'dark')}
        >
            {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
        </Button>
    );
}

const features: {
    icon: ComponentType<{ className?: string }>;
    title: string;
    description: string;
}[] = [
    {
        icon: SlidersHorizontal,
        title: 'Kelola Kriteria Dinamis',
        description:
            'Tentukan kriteria penilaian beserta bobot dan jenis benefit atau cost. Total bobot divalidasi otomatis hingga 100%.',
    },
    {
        icon: Building2,
        title: 'Bandingkan Banyak Kos',
        description:
            'Tambahkan beberapa alternatif kos dan isi nilai setiap kriteria melalui matriks yang mudah digunakan.',
    },
    {
        icon: Calculator,
        title: 'Perhitungan Transparan',
        description:
            'Metode SAW ditampilkan langkah demi langkah: matriks keputusan, normalisasi, pembobotan, hingga nilai preferensi.',
    },
    {
        icon: Trophy,
        title: 'Ranking & Rekomendasi',
        description:
            'Sistem mengurutkan kos dari nilai tertinggi dan merekomendasikan pilihan terbaik lengkap dengan grafik.',
    },
];

const steps: {
    step: string;
    icon: ComponentType<{ className?: string }>;
    title: string;
    description: string;
}[] = [
    {
        step: '01',
        icon: SlidersHorizontal,
        title: 'Atur Kriteria & Bobot',
        description:
            'Masukkan kriteria seperti harga, jarak, fasilitas, dan keamanan beserta bobot kepentingannya.',
    },
    {
        step: '02',
        icon: Table2,
        title: 'Isi Data Alternatif',
        description:
            'Tambahkan kos yang ingin dibandingkan, lalu isi nilai tiap kos untuk setiap kriteria.',
    },
    {
        step: '03',
        icon: Trophy,
        title: 'Lihat Rekomendasi',
        description:
            'Jalankan perhitungan SAW dan dapatkan peringkat serta rekomendasi kos terbaik secara objektif.',
    },
];

const previewRanking = [
    { code: 'C', name: 'Kos C', score: 0.8465, width: 100, best: true },
    { code: 'E', name: 'Kos E', score: 0.6917, width: 82 },
    { code: 'A', name: 'Kos A', score: 0.675, width: 80 },
    { code: 'B', name: 'Kos B', score: 0.6442, width: 76 },
    { code: 'D', name: 'Kos D', score: 0.58, width: 69 },
];

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Selamat Datang" />

            <div className="flex min-h-screen flex-col bg-background text-foreground">
                {/* Header */}
                <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
                    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                        <Logo />
                        <nav className="hidden items-center gap-6 md:flex">
                            <a
                                href="#fitur"
                                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Fitur
                            </a>
                            <a
                                href="#cara-kerja"
                                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Cara Kerja
                            </a>
                        </nav>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <ThemeToggle />
                            {auth.user ? (
                                <Button size="sm" asChild>
                                    <Link href={dashboard()}>Buka Dashboard</Link>
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        asChild
                                        className="hidden sm:inline-flex"
                                    >
                                        <Link href={login()}>Masuk</Link>
                                    </Button>
                                    <Button size="sm" asChild>
                                        <Link href={register()}>Daftar</Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Hero */}
                <section className="relative overflow-hidden">
                    <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
                    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
                        <div className="flex flex-col items-center text-center">
                            <Badge
                                variant="secondary"
                                className="mb-4 gap-1.5 px-3 py-1 sm:mb-6"
                            >
                                <Sparkles className="size-3.5" />
                                <span>Metode Simple Additive Weighting</span>
                            </Badge>
                            <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
                                Pilih Kos Terbaik dengan{' '}
                                <span className="text-primary">
                                    Keputusan yang Objektif
                                </span>
                            </h1>
                            <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:mt-6 sm:text-lg">
                                KosRank membantu mahasiswa membandingkan
                                kos berdasarkan beberapa kriteria menggunakan
                                metode SAW, lalu menghasilkan peringkat dan
                                rekomendasi yang transparan.
                            </p>
                            <div className="mt-8 flex w-full flex-col gap-3 sm:mt-10 sm:w-auto sm:flex-row sm:gap-4">
                                {auth.user ? (
                                    <Button
                                        size="lg"
                                        className="w-full gap-2 px-8 sm:w-auto"
                                        asChild
                                    >
                                        <Link href={dashboard()}>
                                            Buka Dashboard
                                            <LayoutDashboard className="size-4" />
                                        </Link>
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            size="lg"
                                            className="w-full gap-2 px-8 sm:w-auto"
                                            asChild
                                        >
                                            <Link href={register()}>
                                                Mulai Sekarang
                                                <ArrowRight className="size-4" />
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            className="w-full gap-2 px-8 sm:w-auto"
                                            asChild
                                        >
                                            <Link href={login()}>Masuk</Link>
                                        </Button>
                                    </>
                                )}
                            </div>
                            <p className="mt-4 text-xs text-muted-foreground sm:text-sm">
                                Gratis • Mudah • Akurat
                            </p>
                        </div>
                    </div>
                </section>

                {/* App preview */}
                <section className="relative overflow-hidden pb-0">
                    <div className="mx-auto max-w-5xl px-2 sm:px-6">
                        <div className="relative">
                            <div className="overflow-hidden rounded-t-xl border border-b-0 bg-card shadow-2xl sm:rounded-t-2xl">
                                {/* Browser chrome */}
                                <div className="flex items-center gap-2 border-b bg-muted/50 px-3 py-2 sm:px-4 sm:py-2.5">
                                    <div className="flex gap-1.5">
                                        <span className="size-2 rounded-full bg-red-400 sm:size-2.5" />
                                        <span className="size-2 rounded-full bg-yellow-400 sm:size-2.5" />
                                        <span className="size-2 rounded-full bg-green-400 sm:size-2.5" />
                                    </div>
                                    <div className="ml-2 flex-1 sm:ml-3">
                                        <div className="mx-auto h-5 max-w-xs rounded-md bg-muted px-3 text-center text-[9px] leading-5 text-muted-foreground sm:text-[10px]">
                                            kosrank.test/result
                                        </div>
                                    </div>
                                </div>

                                {/* Mock content */}
                                <div className="p-3 sm:p-6">
                                    {/* Stat cards */}
                                    <div className="grid grid-cols-3 gap-2 sm:gap-4">
                                        {[
                                            {
                                                icon: SlidersHorizontal,
                                                value: '4',
                                                label: 'Kriteria',
                                            },
                                            {
                                                icon: Building2,
                                                value: '5',
                                                label: 'Alternatif',
                                            },
                                            {
                                                icon: Calculator,
                                                value: 'SAW',
                                                label: 'Metode',
                                            },
                                        ].map((stat) => (
                                            <div
                                                key={stat.label}
                                                className="rounded-lg border bg-card p-2 sm:p-4"
                                            >
                                                <div className="flex size-6 items-center justify-center rounded-md bg-primary/10 sm:size-8">
                                                    <stat.icon className="size-3 text-primary sm:size-4" />
                                                </div>
                                                <p className="mt-1.5 text-sm font-bold sm:mt-3 sm:text-2xl">
                                                    {stat.value}
                                                </p>
                                                <p className="text-[8px] text-muted-foreground sm:text-xs">
                                                    {stat.label}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Ranking + chart */}
                                    <div className="mt-3 grid gap-2 sm:mt-6 sm:gap-4 lg:grid-cols-7">
                                        {/* Ranking table */}
                                        <div className="rounded-lg border p-2.5 sm:p-4 lg:col-span-4">
                                            <p className="text-[11px] font-medium sm:text-sm">
                                                Peringkat Kos
                                            </p>
                                            <p className="text-[8px] text-muted-foreground sm:text-xs">
                                                Berdasarkan nilai preferensi SAW
                                            </p>
                                            <div className="mt-2 space-y-1.5 sm:mt-3 sm:space-y-2">
                                                {previewRanking.map(
                                                    (row, index) => (
                                                        <div
                                                            key={row.code}
                                                            className={`flex items-center gap-2 rounded-md border p-1.5 sm:p-2.5 ${
                                                                row.best
                                                                    ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-900/10'
                                                                    : ''
                                                            }`}
                                                        >
                                                            <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[8px] font-bold text-primary sm:size-6 sm:text-xs">
                                                                {index + 1}
                                                            </span>
                                                            <span className="flex-1 text-[9px] font-medium sm:text-xs">
                                                                {row.name}
                                                            </span>
                                                            {row.best && (
                                                                <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[7px] font-medium text-emerald-600 sm:text-[10px] dark:text-emerald-400">
                                                                    Terbaik
                                                                </span>
                                                            )}
                                                            <span className="shrink-0 text-[9px] text-muted-foreground tabular-nums sm:text-xs">
                                                                {row.score.toFixed(
                                                                    4,
                                                                )}
                                                            </span>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </div>

                                        {/* Bar chart mock */}
                                        <div className="hidden self-start rounded-lg border p-3 sm:block sm:p-4 lg:col-span-3">
                                            <p className="flex items-center gap-1.5 text-xs font-medium sm:text-sm">
                                                <BarChart3 className="size-3.5" />
                                                Grafik Nilai
                                            </p>
                                            <p className="text-[9px] text-muted-foreground sm:text-xs">
                                                Perbandingan nilai preferensi
                                            </p>
                                            <div className="mt-3 space-y-2.5">
                                                {previewRanking.map((row) => (
                                                    <div
                                                        key={row.code}
                                                        className="space-y-1"
                                                    >
                                                        <div className="flex items-center justify-between text-[10px] sm:text-xs">
                                                            <span>
                                                                {row.name}
                                                            </span>
                                                        </div>
                                                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                                            <div
                                                                className={`h-full rounded-full ${
                                                                    row.best
                                                                        ? 'bg-emerald-500'
                                                                        : 'bg-primary'
                                                                }`}
                                                                style={{
                                                                    width: `${row.width}%`,
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Gradient fade */}
                            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background to-transparent" />
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section id="fitur" className="py-16 sm:py-24 lg:py-32">
                    <div className="mx-auto max-w-6xl px-4 sm:px-6">
                        <div className="flex flex-col items-center text-center">
                            <Badge variant="secondary" className="mb-4">
                                Fitur Utama
                            </Badge>
                            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                                Semua yang Dibutuhkan untuk Memilih Kos
                            </h2>
                            <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:mt-4 sm:text-base">
                                KosRank menyediakan alur lengkap dari
                                pengelolaan data hingga rekomendasi akhir.
                            </p>
                        </div>

                        <div className="mt-10 grid gap-4 sm:mt-16 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                            {features.map((feature) => (
                                <Card
                                    key={feature.title}
                                    className="border bg-card transition-shadow hover:shadow-md"
                                >
                                    <CardContent className="p-6">
                                        <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                                            <feature.icon className="size-6 text-primary" />
                                        </div>
                                        <h3 className="mt-4 text-lg font-semibold">
                                            {feature.title}
                                        </h3>
                                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                            {feature.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How it works */}
                <section
                    id="cara-kerja"
                    className="border-y bg-muted/30 py-16 sm:py-24 lg:py-32"
                >
                    <div className="mx-auto max-w-6xl px-4 sm:px-6">
                        <div className="flex flex-col items-center text-center">
                            <Badge variant="secondary" className="mb-4">
                                Cara Kerja
                            </Badge>
                            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                                Tiga Langkah Mudah
                            </h2>
                            <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:mt-4 sm:text-base">
                                Dari memasukkan data hingga mendapatkan
                                rekomendasi kos terbaik.
                            </p>
                        </div>

                        <div className="mt-10 grid gap-10 sm:mt-16 md:grid-cols-3 md:gap-8">
                            {steps.map((item) => (
                                <div
                                    key={item.step}
                                    className="flex flex-col items-center text-center"
                                >
                                    <div className="relative">
                                        <span className="absolute top-1/2 right-full mr-2 -translate-y-1/2 text-4xl font-bold text-muted-foreground/30 sm:mr-3 sm:text-5xl">
                                            {item.step}
                                        </span>
                                        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 sm:size-16">
                                            <item.icon className="size-6 text-primary sm:size-7" />
                                        </div>
                                    </div>
                                    <h3 className="mt-6 text-lg font-semibold">
                                        {item.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                        {item.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-16 sm:py-24 lg:py-32">
                    <div className="mx-auto max-w-6xl px-4 sm:px-6">
                        <div className="flex flex-col items-center text-center">
                            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                                Siap Menemukan Kos Terbaik?
                            </h2>
                            <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:mt-4 sm:text-base">
                                Mulai bandingkan kos secara objektif
                                dengan metode SAW sekarang juga.
                            </p>
                            <ul className="mt-6 flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:gap-6">
                                {[
                                    'Perhitungan transparan',
                                    'Hasil akurat',
                                    'Mudah digunakan',
                                ].map((item) => (
                                    <li
                                        key={item}
                                        className="flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 className="size-4 text-primary" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-8 flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
                                <Button
                                    size="lg"
                                    className="w-full gap-2 px-8 sm:w-auto"
                                    asChild
                                >
                                    <Link
                                        href={
                                            auth.user ? dashboard() : register()
                                        }
                                    >
                                        {auth.user
                                            ? 'Buka Dashboard'
                                            : 'Mulai Sekarang'}
                                        <ArrowRight className="size-4" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t">
                    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
                        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                            <div className="col-span-2 md:col-span-2">
                                <Logo />
                                <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                                    Sistem Pendukung Keputusan pemilihan
                                    kos bagi mahasiswa menggunakan metode Simple
                                    Additive Weighting.
                                </p>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold">
                                    Navigasi
                                </h4>
                                <ul className="mt-3 space-y-2">
                                    <li>
                                        <a
                                            href="#fitur"
                                            className="text-sm text-muted-foreground hover:text-foreground"
                                        >
                                            Fitur
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#cara-kerja"
                                            className="text-sm text-muted-foreground hover:text-foreground"
                                        >
                                            Cara Kerja
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold">Akun</h4>
                                <ul className="mt-3 space-y-2">
                                    <li>
                                        <Link
                                            href={login()}
                                            className="text-sm text-muted-foreground hover:text-foreground"
                                        >
                                            Masuk
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href={register()}
                                            className="text-sm text-muted-foreground hover:text-foreground"
                                        >
                                            Daftar
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <Separator className="my-6 sm:my-8" />
                        <p className="text-center text-xs text-muted-foreground sm:text-sm">
                            © 2026 KosRank — Tugas UAS Sistem Pendukung
                            Keputusan.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
