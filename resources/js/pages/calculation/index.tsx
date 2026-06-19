import { Head, Link } from '@inertiajs/react';
import CalculationController from '@/actions/App/Http/Controllers/CalculationController';
import CriterionController from '@/actions/App/Http/Controllers/CriterionController';
import AlertError from '@/components/alert-error';
import PageHeader from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type CriterionInfo = {
    id: number;
    code: string;
    name: string;
    type: 'benefit' | 'cost';
    weight: number;
    weight_normalized: number;
};

type AlternativeInfo = {
    id: number;
    code: string;
    name: string;
};

type MinMaxInfo = { min: number; max: number };

type RankingRow = {
    rank: number;
    alternative_id: number;
    code: string;
    name: string;
    score: number;
};

type SawResult = {
    criteria: CriterionInfo[];
    alternatives: AlternativeInfo[];
    decision_matrix: Record<string, Record<string, number>>;
    min_max: Record<string, MinMaxInfo>;
    normalized_matrix: Record<string, Record<string, number>>;
    weighted_matrix: Record<string, Record<string, number>>;
    scores: Record<string, number>;
    ranking: RankingRow[];
    best: RankingRow | null;
};

type PageProps = {
    validationErrors: string[];
    result: SawResult | null;
};

const decimal = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
});

const number = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 2,
});

function SectionTitle({ step, title }: { step: number; title: string }) {
    return (
        <h2 className="mb-3 flex items-center gap-2 text-base font-semibold">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {step}
            </span>
            {title}
        </h2>
    );
}

export default function CalculationIndex({
    validationErrors,
    result,
}: PageProps) {
    return (
        <>
            <Head title="Perhitungan SAW" />

            <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
                <PageHeader
                    title="Perhitungan SAW"
                    description="Proses perhitungan metode Simple Additive Weighting ditampilkan secara transparan."
                />

                {validationErrors.length > 0 && (
                    <div className="space-y-4">
                        <AlertError
                            title="Perhitungan belum dapat dilakukan"
                            errors={validationErrors}
                        />
                        <div className="flex flex-wrap gap-2">
                            <Button asChild variant="outline">
                                <Link href={CriterionController.index.url()}>
                                    Atur Kriteria
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}

                {result && (
                    <div className="space-y-8">
                        {/* 1. Kriteria & Bobot */}
                        <section>
                            <SectionTitle step={1} title="Kriteria & Bobot" />
                            <div className="overflow-x-auto rounded-lg border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Kode</TableHead>
                                            <TableHead>Kriteria</TableHead>
                                            <TableHead>Jenis</TableHead>
                                            <TableHead className="text-right">
                                                Bobot
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Bobot Ternormalisasi
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {result.criteria.map((criterion) => (
                                            <TableRow key={criterion.id}>
                                                <TableCell className="font-medium">
                                                    {criterion.code}
                                                </TableCell>
                                                <TableCell>
                                                    {criterion.name}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            criterion.type ===
                                                            'benefit'
                                                                ? 'default'
                                                                : 'secondary'
                                                        }
                                                    >
                                                        {criterion.type ===
                                                        'benefit'
                                                            ? 'Benefit'
                                                            : 'Cost'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {number.format(
                                                        criterion.weight,
                                                    )}
                                                    %
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {decimal.format(
                                                        criterion.weight_normalized,
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </section>

                        {/* 2. Matriks Keputusan */}
                        <section>
                            <SectionTitle
                                step={2}
                                title="Matriks Keputusan (Nilai Awal)"
                            />
                            <MatrixTable
                                criteria={result.criteria}
                                alternatives={result.alternatives}
                                matrix={result.decision_matrix}
                                formatter={(v) => number.format(v)}
                            />
                        </section>

                        {/* 3. Min / Max */}
                        <section>
                            <SectionTitle
                                step={3}
                                title="Nilai Minimum / Maksimum per Kriteria"
                            />
                            <div className="overflow-x-auto rounded-lg border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Kriteria</TableHead>
                                            <TableHead>Jenis</TableHead>
                                            <TableHead className="text-right">
                                                Min
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Max
                                            </TableHead>
                                            <TableHead>
                                                Dipakai (sesuai jenis)
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {result.criteria.map((criterion) => (
                                            <TableRow key={criterion.id}>
                                                <TableCell>
                                                    {criterion.code} -{' '}
                                                    {criterion.name}
                                                </TableCell>
                                                <TableCell>
                                                    {criterion.type ===
                                                    'benefit'
                                                        ? 'Benefit'
                                                        : 'Cost'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {number.format(
                                                        result.min_max[
                                                            criterion.id
                                                        ].min,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {number.format(
                                                        result.min_max[
                                                            criterion.id
                                                        ].max,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {criterion.type ===
                                                    'benefit'
                                                        ? 'Max (pembagi)'
                                                        : 'Min (pembilang)'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </section>

                        {/* 4. Normalisasi */}
                        <section>
                            <SectionTitle
                                step={4}
                                title="Matriks Normalisasi (R)"
                            />
                            <p className="mb-3 text-sm text-muted-foreground">
                                Benefit: nilai ÷ maksimum. Cost: minimum ÷
                                nilai.
                            </p>
                            <MatrixTable
                                criteria={result.criteria}
                                alternatives={result.alternatives}
                                matrix={result.normalized_matrix}
                                formatter={(v) => decimal.format(v)}
                            />
                        </section>

                        {/* 5. Terbobot */}
                        <section>
                            <SectionTitle
                                step={5}
                                title="Matriks Ternormalisasi Terbobot"
                            />
                            <p className="mb-3 text-sm text-muted-foreground">
                                Setiap nilai normalisasi dikalikan bobot
                                ternormalisasi kriteria.
                            </p>
                            <MatrixTable
                                criteria={result.criteria}
                                alternatives={result.alternatives}
                                matrix={result.weighted_matrix}
                                formatter={(v) => decimal.format(v)}
                            />
                        </section>

                        {/* 6. Nilai Preferensi & 7. Ranking */}
                        <section>
                            <SectionTitle
                                step={6}
                                title="Nilai Preferensi (Vi) & Ranking"
                            />
                            <div className="overflow-x-auto rounded-lg border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-right">
                                                Peringkat
                                            </TableHead>
                                            <TableHead>Kode</TableHead>
                                            <TableHead>Alternatif</TableHead>
                                            <TableHead className="text-right">
                                                Nilai Preferensi (Vi)
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {result.ranking.map((row) => (
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
                                                <TableCell className="text-right">
                                                    {decimal.format(row.score)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </>
    );
}

function MatrixTable({
    criteria,
    alternatives,
    matrix,
    formatter,
}: {
    criteria: CriterionInfo[];
    alternatives: AlternativeInfo[];
    matrix: Record<string, Record<string, number>>;
    formatter: (value: number) => string;
}) {
    return (
        <div className="overflow-x-auto rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="min-w-40">Alternatif</TableHead>
                        {criteria.map((criterion) => (
                            <TableHead
                                key={criterion.id}
                                className="text-right"
                            >
                                {criterion.code}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {alternatives.map((alternative) => (
                        <TableRow key={alternative.id}>
                            <TableCell>
                                <span className="font-medium">
                                    {alternative.code}
                                </span>{' '}
                                <span className="text-muted-foreground">
                                    {alternative.name}
                                </span>
                            </TableCell>
                            {criteria.map((criterion) => (
                                <TableCell
                                    key={criterion.id}
                                    className="text-right"
                                >
                                    {formatter(
                                        matrix[alternative.id]?.[
                                            criterion.id
                                        ] ?? 0,
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

CalculationIndex.layout = {
    breadcrumbs: [
        {
            title: 'Perhitungan',
            href: CalculationController.index.url(),
        },
    ],
};
