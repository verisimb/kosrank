import { Head, Link } from '@inertiajs/react';
import { Trophy } from 'lucide-react';
import AlternativeValueController from '@/actions/App/Http/Controllers/AlternativeValueController';
import ResultController from '@/actions/App/Http/Controllers/ResultController';
import AlertError from '@/components/alert-error';
import PageHeader from '@/components/page-header';
import PreferenceBarChart from '@/components/preference-bar-chart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type RankingRow = {
    rank: number;
    alternative_id: number;
    code: string;
    name: string;
    score: number;
};

type PageProps = {
    validationErrors: string[];
    ranking: RankingRow[];
    best: RankingRow | null;
};

const decimal = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
});

export default function ResultIndex({
    validationErrors,
    ranking,
    best,
}: PageProps) {
    return (
        <>
            <Head title="Hasil & Rekomendasi" />

            <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
                <PageHeader
                    title="Hasil & Rekomendasi"
                    description="Peringkat akhir kos berdasarkan metode Simple Additive Weighting."
                />

                {validationErrors.length > 0 && (
                    <div className="space-y-4">
                        <AlertError
                            title="Hasil belum dapat ditampilkan"
                            errors={validationErrors}
                        />
                        <Button asChild variant="outline">
                            <Link href={AlternativeValueController.index.url()}>
                                Lengkapi Nilai Alternatif
                            </Link>
                        </Button>
                    </div>
                )}

                {validationErrors.length === 0 && ranking.length > 0 && (
                    <div className="space-y-6">
                        {/* Rekomendasi utama */}
                        {best && (
                            <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-900/10">
                                <CardHeader>
                                    <CardDescription className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                                        <Trophy className="h-4 w-4" />
                                        Rekomendasi Utama
                                    </CardDescription>
                                    <CardTitle className="text-2xl">
                                        {best.name} ({best.code})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm text-muted-foreground">
                                    <span className="font-medium text-foreground">
                                        {best.name}
                                    </span>{' '}
                                    menempati peringkat pertama dengan nilai
                                    preferensi tertinggi sebesar{' '}
                                    <span className="font-medium text-foreground">
                                        {decimal.format(best.score)}
                                    </span>
                                    , sehingga menjadi pilihan kos terbaik
                                    berdasarkan kriteria dan bobot yang
                                    ditetapkan.
                                </CardContent>
                            </Card>
                        )}

                        {/* Grafik + tabel peringkat berdampingan di layar lebar */}
                        <div className="grid items-start gap-6 lg:grid-cols-2">
                            {/* Grafik batang nilai preferensi */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">
                                        Grafik Nilai Preferensi
                                    </CardTitle>
                                    <CardDescription>
                                        Perbandingan nilai preferensi (Vi) tiap
                                        alternatif. Semakin panjang batang,
                                        semakin tinggi nilainya.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <PreferenceBarChart data={ranking} />
                                </CardContent>
                            </Card>

                            {/* Tabel peringkat */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">
                                        Peringkat Kos
                                    </CardTitle>
                                    <CardDescription>
                                        Urutan kos dari nilai akhir tertinggi ke
                                        terendah.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto rounded-lg border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="text-right">
                                                        Peringkat
                                                    </TableHead>
                                                    <TableHead>Kode</TableHead>
                                                    <TableHead>
                                                        Nama Kos
                                                    </TableHead>
                                                    <TableHead className="text-right">
                                                        Nilai Akhir
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {ranking.map((row) => (
                                                    <TableRow
                                                        key={row.alternative_id}
                                                        className={
                                                            row.rank === 1
                                                                ? 'bg-emerald-50 dark:bg-emerald-900/10'
                                                                : undefined
                                                        }
                                                    >
                                                        <TableCell className="text-right font-medium">
                                                            {row.rank}
                                                        </TableCell>
                                                        <TableCell>
                                                            {row.code}
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            {row.name}
                                                            {row.rank === 1 && (
                                                                <Badge className="ml-2">
                                                                    Terbaik
                                                                </Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right tabular-nums">
                                                            {decimal.format(
                                                                row.score,
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

ResultIndex.layout = {
    breadcrumbs: [
        {
            title: 'Hasil & Rekomendasi',
            href: ResultController.index.url(),
        },
    ],
};
