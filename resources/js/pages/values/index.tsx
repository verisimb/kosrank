import { Head, useForm } from '@inertiajs/react';
import AlternativeValueController from '@/actions/App/Http/Controllers/AlternativeValueController';
import PageHeader from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type CriterionType = 'benefit' | 'cost';

type Criterion = {
    id: number;
    code: string;
    name: string;
    type: CriterionType;
    unit: string | null;
};

type Alternative = {
    id: number;
    code: string;
    name: string;
};

type ValuesMap = Record<string, Record<string, number | null>>;

type PageProps = {
    criteria: Criterion[];
    alternatives: Alternative[];
    values: ValuesMap;
};

type FormValues = Record<string, Record<string, string>>;

function buildInitialValues(
    alternatives: Alternative[],
    criteria: Criterion[],
    values: ValuesMap,
): FormValues {
    const result: FormValues = {};

    for (const alternative of alternatives) {
        result[alternative.id] = {};

        for (const criterion of criteria) {
            const current = values[alternative.id]?.[criterion.id];
            result[alternative.id][criterion.id] =
                current === null || current === undefined
                    ? ''
                    : String(current);
        }
    }

    return result;
}

export default function ValuesIndex({
    criteria,
    alternatives,
    values,
}: PageProps) {
    const hasData = criteria.length > 0 && alternatives.length > 0;

    const form = useForm<{ values: FormValues }>({
        values: buildInitialValues(alternatives, criteria, values),
    });

    const handleChange = (
        alternativeId: number,
        criterionId: number,
        value: string,
    ) => {
        form.setData('values', {
            ...form.data.values,
            [alternativeId]: {
                ...form.data.values[alternativeId],
                [criterionId]: value,
            },
        });
    };

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        form.put(AlternativeValueController.update.url(), {
            preserveScroll: true,
        });
    };

    const totalCells = criteria.length * alternatives.length;
    let filledCells = 0;

    for (const alternative of alternatives) {
        for (const criterion of criteria) {
            const value = form.data.values[alternative.id]?.[criterion.id];

            if (value !== '' && value !== undefined) {
                filledCells += 1;
            }
        }
    }

    const isComplete = totalCells > 0 && filledCells === totalCells;

    return (
        <>
            <Head title="Nilai Alternatif" />

            <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
                <PageHeader
                    title="Nilai Alternatif"
                    description="Isi nilai setiap kos untuk setiap kriteria penilaian."
                />

                {!hasData ? (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/10 dark:text-amber-300">
                        Anda perlu memiliki minimal satu kriteria dan satu
                        alternatif sebelum dapat mengisi nilai. Silakan lengkapi
                        data kriteria dan alternatif terlebih dahulu.
                    </div>
                ) : (
                    <form onSubmit={submit} className="space-y-4">
                        <div
                            className={`rounded-lg border p-4 text-sm ${
                                isComplete
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/10 dark:text-emerald-300'
                                    : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/10 dark:text-amber-300'
                            }`}
                        >
                            <span className="font-medium">
                                Kelengkapan data: {filledCells}/{totalCells}{' '}
                                nilai terisi.
                            </span>{' '}
                            {isComplete
                                ? '— semua nilai sudah lengkap.'
                                : '— lengkapi semua nilai sebelum melakukan perhitungan.'}
                        </div>

                        <div className="overflow-x-auto rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="min-w-40">
                                            Alternatif
                                        </TableHead>
                                        {criteria.map((criterion) => (
                                            <TableHead
                                                key={criterion.id}
                                                className="min-w-48 py-3 align-bottom"
                                            >
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="font-medium whitespace-nowrap">
                                                        {criterion.code} -{' '}
                                                        {criterion.name}
                                                    </span>
                                                    <span className="flex items-center gap-2">
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
                                                        {criterion.unit && (
                                                            <span className="text-xs font-normal text-muted-foreground">
                                                                (
                                                                {criterion.unit}
                                                                )
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {alternatives.map((alternative) => (
                                        <TableRow key={alternative.id}>
                                            <TableCell className="align-top">
                                                <div className="font-medium">
                                                    {alternative.code}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {alternative.name}
                                                </div>
                                            </TableCell>
                                            {criteria.map((criterion) => {
                                                const errorKey = `values.${alternative.id}.${criterion.id}`;
                                                const error =
                                                    form.errors[
                                                        errorKey as keyof typeof form.errors
                                                    ];

                                                return (
                                                    <TableCell
                                                        key={criterion.id}
                                                        className="align-top"
                                                    >
                                                        <Input
                                                            type="number"
                                                            step="any"
                                                            min="0"
                                                            inputMode="decimal"
                                                            value={
                                                                form.data
                                                                    .values[
                                                                    alternative
                                                                        .id
                                                                ]?.[
                                                                    criterion.id
                                                                ] ?? ''
                                                            }
                                                            onChange={(e) =>
                                                                handleChange(
                                                                    alternative.id,
                                                                    criterion.id,
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            aria-invalid={
                                                                error
                                                                    ? true
                                                                    : undefined
                                                            }
                                                        />
                                                        {error && (
                                                            <p className="mt-1 text-xs text-destructive">
                                                                {error}
                                                            </p>
                                                        )}
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={form.processing}>
                                Simpan Nilai
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </>
    );
}

ValuesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Nilai Alternatif',
            href: AlternativeValueController.index.url(),
        },
    ],
};
