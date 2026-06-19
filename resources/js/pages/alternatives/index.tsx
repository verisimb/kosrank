import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AlternativeController from '@/actions/App/Http/Controllers/AlternativeController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type Alternative = {
    id: number;
    code: string;
    name: string;
    location: string;
};

type PageProps = {
    alternatives: Alternative[];
};

type FormData = {
    code: string;
    name: string;
    location: string;
};

const emptyForm: FormData = {
    code: '',
    name: '',
    location: '',
};

function AlternativeDialog({
    alternative,
    open,
    onOpenChange,
}: {
    alternative: Alternative | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const isEditing = alternative !== null;

    const form = useForm<FormData>(
        isEditing
            ? {
                  code: alternative.code,
                  name: alternative.name,
                  location: alternative.location,
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
            form.put(AlternativeController.update.url(alternative.id), options);
        } else {
            form.post(AlternativeController.store.url(), options);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Ubah Alternatif' : 'Tambah Alternatif'}
                    </DialogTitle>
                    <DialogDescription>
                        Lengkapi data tempat kos di bawah ini.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="code">Kode</Label>
                        <Input
                            id="code"
                            value={form.data.code}
                            onChange={(e) => form.setData('code', e.target.value)}
                            placeholder="Misal: A1"
                            autoFocus
                        />
                        <InputError message={form.errors.code} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="name">Nama Kos</Label>
                        <Input
                            id="name"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            placeholder="Misal: Kos Mawar"
                        />
                        <InputError message={form.errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="location">Lokasi</Label>
                        <Input
                            id="location"
                            value={form.data.location}
                            onChange={(e) =>
                                form.setData('location', e.target.value)
                            }
                            placeholder="Misal: Jl. Mawar No. 1"
                        />
                        <InputError message={form.errors.location} />
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

export default function AlternativesIndex({ alternatives }: PageProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<Alternative | null>(null);
    const [deleting, setDeleting] = useState<Alternative | null>(null);

    const openCreate = () => {
        setEditing(null);
        setDialogOpen(true);
    };

    const openEdit = (alternative: Alternative) => {
        setEditing(alternative);
        setDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!deleting) {
            return;
        }

        router.delete(AlternativeController.destroy.url(deleting.id), {
            preserveScroll: true,
            onSuccess: () => setDeleting(null),
        });
    };

    return (
        <>
            <Head title="Alternatif" />

            <div className="px-4 py-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Heading
                        title="Alternatif Kos"
                        description="Kelola daftar tempat kos yang akan dibandingkan."
                    />
                    <Button onClick={openCreate}>Tambah Alternatif</Button>
                </div>

                <div className="overflow-x-auto rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Kode</TableHead>
                                <TableHead>Nama Kos</TableHead>
                                <TableHead>Lokasi</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {alternatives.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className="py-8 text-center text-muted-foreground"
                                    >
                                        Belum ada alternatif. Silakan tambah
                                        tempat kos terlebih dahulu.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                alternatives.map((alternative) => (
                                    <TableRow key={alternative.id}>
                                        <TableCell className="font-medium">
                                            {alternative.code}
                                        </TableCell>
                                        <TableCell>{alternative.name}</TableCell>
                                        <TableCell>
                                            {alternative.location}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        openEdit(alternative)
                                                    }
                                                >
                                                    Ubah
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() =>
                                                        setDeleting(alternative)
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
                <AlternativeDialog
                    key={editing?.id ?? 'create'}
                    alternative={editing}
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
                        <DialogTitle>Hapus Alternatif</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus kos{' '}
                            <span className="font-medium">
                                {deleting?.name}
                            </span>
                            ? Seluruh nilai kos ini juga akan ikut terhapus dan
                            tindakan ini tidak dapat dibatalkan.
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

AlternativesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Alternatif',
            href: AlternativeController.index.url(),
        },
    ],
};
