import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import CriterionController from '@/actions/App/Http/Controllers/CriterionController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
    weight: number;
    unit: string | null;
};

type PageProps = {
    criteria: Criterion[];
    totalWeight: number;
};

type FormData = {
    code: string;
    name: string;
    type: CriterionType;
    weight: string;
    unit: string;
};

const emptyForm: FormData = {
    code: '',
    name: '',
    type: 'benefit',
    weight: '',
    unit: '',
};

const weightFormatter = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 2,
});

function CriterionDialog({
    criterion,
    open,
    onOpenChange,
}: {
    criterion: Criterion | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const isEditing = criterion !== null;

    const form = useForm<FormData>(
        isEditing
            ? {
                  code: criterion.code,
                  name: criterion.name,
                  type: criterion.type,
                  weight: String(criterion.weight),
                  unit: criterion.unit ?? '',
              }
            : emptyForm,
    );

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        };

        if (isEditing) {
            form.put(CriterionController.update.url(criterion.id), options);
        } else {
            form.post(CriterionController.store.url(), options);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Ubah Kriteria' : 'Tambah Kriteria'}
                    </DialogTitle>
                    <DialogDescription>
                        Lengkapi data kriteria penilaian di bawah ini.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="code">Kode</Label>
                        <Input
                            id="code"
                            value={form.data.code}
                            onChange={(e) => form.setData('code', e.target.value)}
                            placeholder="Misal: C1"
                            autoFocus
                        />
                        <InputError message={form.errors.code} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="name">Nama Kriteria</Label>
                        <Input
                            id="name"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            placeholder="Misal: Harga sewa per bulan"
                        />
                        <InputError message={form.errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="type">Jenis</Label>
                        <Select
                            value={form.data.type}
                            onValueChange={(value) =>
                                form.setData('type', value as CriterionType)
                            }
                        >
                            <SelectTrigger id="type">
                                <SelectValue placeholder="Pilih jenis" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="benefit">
                                    Benefit (semakin besar semakin baik)
                                </SelectItem>
                                <SelectItem value="cost">
                                    Cost (semakin kecil semakin baik)
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={form.errors.type} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="weight">Bobot (%)</Label>
                        <Input
                            id="weight"
                            type="number"
                            step="0.01"
                            min="0"
                            value={form.data.weight}
                            onChange={(e) =>
                                form.setData('weight', e.target.value)
                            }
                            placeholder="Misal: 35"
                        />
                        <InputError message={form.errors.weight} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="unit">Satuan (opsional)</Label>
                        <Input
                            id="unit"
                            value={form.data.unit}
                            onChange={(e) => form.setData('unit', e.target.value)}
                            placeholder="Misal: Rp, km, skala 1-5"
                        />
                        <InputError message={form.errors.unit} />
                    </div>

                    <DialogFooter className="gap-2">
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">
                                Batal
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={form.processing}>
                            Simpan
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function CriteriaIndex({ criteria, totalWeight }: PageProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<Criterion | null>(null);
    const [deleting, setDeleting] = useState<Criterion | null>(null);

    const openCreate = () => {
        setEditing(null);
        setDialogOpen(true);
    };

    const openEdit = (criterion: Criterion) => {
        setEditing(criterion);
        setDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!deleting) {
            return;
        }

        router.delete(CriterionController.destroy.url(deleting.id), {
            preserveScroll: true,
            onSuccess: () => setDeleting(null),
        });
    };

    const isWeightValid = Math.abs(totalWeight - 100) < 0.01;

    return (
        <>
            <Head title="Kriteria" />

            <div className="px-4 py-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Heading
                        title="Kriteria"
                        description="Kelola kriteria penilaian beserta bobot dan jenisnya."
                    />
                    <Button onClick={openCreate}>Tambah Kriteria</Button>
                </div>

                <div
                    className={`mb-4 rounded-lg border p-4 text-sm ${
                        isWeightValid
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/10 dark:text-emerald-300'
                            : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/10 dark:text-amber-300'
                    }`}
                >
                    <span className="font-medium">
                        Total bobot: {weightFormatter.format(totalWeight)}%
                    </span>{' '}
                    {isWeightValid
                        ? '— sudah tepat 100%, siap untuk perhitungan.'
                        : '— total bobot harus tepat 100% sebelum perhitungan dapat dilakukan.'}
                </div>

                <div className="overflow-x-auto rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Kode</TableHead>
                                <TableHead>Nama Kriteria</TableHead>
                                <TableHead>Jenis</TableHead>
                                <TableHead className="text-right">Bobot</TableHead>
                                <TableHead>Satuan</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {criteria.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="py-8 text-center text-muted-foreground"
                                    >
                                        Belum ada kriteria. Silakan tambah
                                        kriteria terlebih dahulu.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                criteria.map((criterion) => (
                                    <TableRow key={criterion.id}>
                                        <TableCell className="font-medium">
                                            {criterion.code}
                                        </TableCell>
                                        <TableCell>{criterion.name}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    criterion.type === 'benefit'
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {criterion.type === 'benefit'
                                                    ? 'Benefit'
                                                    : 'Cost'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {weightFormatter.format(
                                                criterion.weight,
                                            )}
                                            %
                                        </TableCell>
                                        <TableCell>
                                            {criterion.unit ?? '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        openEdit(criterion)
                                                    }
                                                >
                                                    Ubah
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() =>
                                                        setDeleting(criterion)
                                                    }
                                                >
                                                    Hapus
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {dialogOpen && (
                <CriterionDialog
                    key={editing?.id ?? 'create'}
                    criterion={editing}
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                />
            )}

            <Dialog
                open={deleting !== null}
                onOpenChange={(open) => !open && setDeleting(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Kriteria</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus kriteria{' '}
                            <span className="font-medium">
                                {deleting?.name}
                            </span>
                            ? Tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">
                                Batal
                            </Button>
                        </DialogClose>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

CriteriaIndex.layout = {
    breadcrumbs: [
        {
            title: 'Kriteria',
            href: CriterionController.index.url(),
        },
    ],
};
