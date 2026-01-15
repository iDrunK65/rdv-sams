import { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import {
    Button,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Spinner,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
} from '@heroui/react';

import { PageHeader } from '@/Components/ui/PageHeader';
import { AdminLayout } from '@/Layouts/AdminLayout';
import { api } from '@/lib/api';
import type { ApiResponse, Calendar } from '@/lib/types';

type SpecialtyRow = {
    id: string;
    label: string;
    color?: string | null;
};

const SpecialtiesIndex = () => {
    const [loading, setLoading] = useState(true);
    const [specialties, setSpecialties] = useState<SpecialtyRow[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<SpecialtyRow | null>(null);
    const [form, setForm] = useState({ label: '', color: '#3B82F6' });

    const loadSpecialties = async () => {
        setLoading(true);
        try {
            const response = await api.get<ApiResponse<Calendar[]>>('/api/calendars');
            const map = new Map<string, SpecialtyRow>();
            response.data.data.forEach((calendar) => {
                if (calendar.scope !== 'specialty') return;
                const specialtyId = calendar.specialtyId || '';
                if (!specialtyId) return;
                if (!map.has(specialtyId)) {
                    map.set(specialtyId, {
                        id: specialtyId,
                        label: calendar.label || 'Specialite',
                        color: calendar.color || null,
                    });
                }
            });
            const items = Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
            setSpecialties(items);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSpecialties();
    }, []);

    const openCreate = () => {
        setEditing(null);
        setForm({ label: '', color: '#3B82F6' });
        setModalOpen(true);
    };

    const openEdit = (specialty: SpecialtyRow) => {
        setEditing(specialty);
        setForm({ label: specialty.label, color: specialty.color || '#3B82F6' });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditing(null);
    };

    const isActionDisabled = true;

    return (
        <AdminLayout>
            <Head title="Specialites" />
            <div className="space-y-6">
                <PageHeader
                    title="Specialites"
                    subtitle="Gerez la liste des specialites."
                    actions={
                        <Button color="primary" onPress={openCreate} isDisabled={isActionDisabled}>
                            Nouvelle specialite
                        </Button>
                    }
                />

                <p className="text-sm text-foreground/60">
                    La gestion des specialites depend d endpoints backend non exposes pour le moment.
                </p>

                {loading ? (
                    <Spinner />
                ) : (
                    <Table aria-label="Specialites">
                        <TableHeader>
                            <TableColumn>Specialite</TableColumn>
                            <TableColumn>Active</TableColumn>
                            <TableColumn>Actions</TableColumn>
                        </TableHeader>
                        <TableBody emptyContent="Aucune specialite">
                            {specialties.map((specialty) => (
                                <TableRow key={specialty.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {specialty.color ? (
                                                <span
                                                    className="h-3 w-3 rounded-full"
                                                    style={{ backgroundColor: specialty.color }}
                                                />
                                            ) : null}
                                            <span className="font-semibold">{specialty.label}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Switch isSelected isDisabled />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                size="sm"
                                                variant="flat"
                                                onPress={() => openEdit(specialty)}
                                                isDisabled={isActionDisabled}
                                            >
                                                Modifier
                                            </Button>
                                            <Button size="sm" color="danger" variant="flat" isDisabled={isActionDisabled}>
                                                Supprimer
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            <Modal isOpen={modalOpen} onClose={closeModal} backdrop="blur" size="lg">
                <ModalContent>
                    <ModalHeader>{editing ? 'Modifier une specialite' : 'Nouvelle specialite'}</ModalHeader>
                    <ModalBody className="space-y-3">
                        <Input
                            label="Nom de la specialite"
                            value={form.label}
                            onValueChange={(value) => setForm({ ...form, label: value })}
                            isRequired
                        />
                        <Input
                            label="Couleur"
                            type="color"
                            value={form.color}
                            onValueChange={(value) => setForm({ ...form, color: value })}
                        />
                        <p className="text-xs text-foreground/60">
                            Module en lecture seule pour le moment.
                        </p>
                    </ModalBody>
                    <ModalFooter className="gap-2">
                        <Button variant="light" onPress={closeModal}>
                            Fermer
                        </Button>
                        <Button color="primary" isDisabled>
                            Enregistrer
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </AdminLayout>
    );
};

export default SpecialtiesIndex;
