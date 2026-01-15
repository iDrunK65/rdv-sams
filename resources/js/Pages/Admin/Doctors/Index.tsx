import { useEffect, useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import {
    Button,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Select,
    SelectItem,
    Spinner,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
} from '@heroui/react';

import { ConfirmDialog } from '@/Components/ui/ConfirmDialog';
import { PageHeader } from '@/Components/ui/PageHeader';
import { AdminLayout } from '@/Layouts/AdminLayout';
import { api } from '@/lib/api';
import type { ApiResponse, Calendar, User } from '@/lib/types';
import { useToast } from '@/hooks/useToast';

type SpecialtyOption = {
    id: string;
    label: string;
};

type FormState = {
    identifier: string;
    firstName: string;
    lastName: string;
    password: string;
    roles: string[];
    specialtyIds: string[];
    isActive: boolean;
};

const emptyForm: FormState = {
    identifier: '',
    firstName: '',
    lastName: '',
    password: '',
    roles: ['doctor'],
    specialtyIds: [],
    isActive: true,
};

const splitName = (name?: string | null): { firstName: string; lastName: string } => {
    if (!name) return { firstName: '', lastName: '' };
    const parts = name.trim().split(' ');
    if (parts.length === 1) return { firstName: parts[0], lastName: '' };
    return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
};

const buildName = (firstName: string, lastName: string): string | undefined => {
    const name = `${firstName} ${lastName}`.trim();
    return name.length > 0 ? name : undefined;
};

const DoctorsIndex = () => {
    const [doctors, setDoctors] = useState<User[]>([]);
    const [specialties, setSpecialties] = useState<SpecialtyOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<User | null>(null);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
    const [deleting, setDeleting] = useState(false);
    const { success } = useToast();

    const specialtyMap = useMemo(() => {
        const map = new Map<string, string>();
        specialties.forEach((specialty) => map.set(specialty.id, specialty.label));
        return map;
    }, [specialties]);

    const loadDoctors = async () => {
        const response = await api.get<ApiResponse<User[]>>('/api/admin/doctors');
        setDoctors(response.data.data);
    };

    const loadSpecialties = async () => {
        const response = await api.get<ApiResponse<Calendar[]>>('/api/calendars');
        const map = new Map<string, string>();

        response.data.data.forEach((calendar) => {
            if (calendar.scope !== 'specialty') return;
            const specialtyId = calendar.specialtyId || '';
            if (!specialtyId) return;
            if (!map.has(specialtyId)) {
                map.set(specialtyId, calendar.label || 'Specialite');
            }
        });

        const items = Array.from(map.entries()).map(([id, label]) => ({ id, label }));
        items.sort((a, b) => a.label.localeCompare(b.label));
        setSpecialties(items);
    };

    useEffect(() => {
        const boot = async () => {
            setLoading(true);
            try {
                await Promise.all([loadDoctors(), loadSpecialties()]);
            } finally {
                setLoading(false);
            }
        };

        boot();
    }, []);

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setModalOpen(true);
    };

    const openEdit = (doctor: User) => {
        const parts = splitName(doctor.name || '');
        setEditing(doctor);
        setForm({
            identifier: doctor.identifier,
            firstName: parts.firstName,
            lastName: parts.lastName,
            password: '',
            roles: doctor.roles || ['doctor'],
            specialtyIds: doctor.specialtyIds || [],
            isActive: Boolean(doctor.isActive),
        });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditing(null);
        setForm(emptyForm);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                identifier: form.identifier,
                name: buildName(form.firstName, form.lastName),
                roles: form.roles,
                specialtyIds: form.specialtyIds,
                isActive: form.isActive,
            };

            if (editing) {
                const id = editing._id || editing.id || '';
                await api.patch(`/api/admin/doctors/${id}`, payload);
                if (form.password) {
                    await api.post(`/api/admin/doctors/${id}/reset-password`, { password: form.password });
                }
                success('Compte mis a jour');
            } else {
                await api.post('/api/admin/doctors', { ...payload, password: form.password });
                success('Compte cree');
            }

            closeModal();
            await loadDoctors();
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = (doctor: User) => {
        setDeleteTarget(doctor);
        setDeleteOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        const id = deleteTarget._id || deleteTarget.id || '';
        setDeleting(true);
        try {
            await api.delete(`/api/admin/doctors/${id}`);
            success('Compte supprime');
            setDeleteOpen(false);
            await loadDoctors();
        } finally {
            setDeleting(false);
        }
    };

    return (
        <AdminLayout>
            <Head title="Comptes" />
            <div className="space-y-6">
                <PageHeader
                    title="Comptes medecins"
                    subtitle="Gerez les comptes des soignants."
                    actions={
                        <Button color="primary" onPress={openCreate}>
                            Nouveau compte
                        </Button>
                    }
                />

                {loading ? (
                    <Spinner />
                ) : (
                    <Table aria-label="Comptes medecins">
                        <TableHeader>
                            <TableColumn>Medecin</TableColumn>
                            <TableColumn>Specialites</TableColumn>
                            <TableColumn>Actions</TableColumn>
                        </TableHeader>
                        <TableBody emptyContent="Aucun compte">
                            {doctors.map((doctor) => {
                                const id = doctor._id || doctor.id || '';
                                const name = doctor.name || doctor.identifier;
                                const labels = (doctor.specialtyIds || [])
                                    .map((specialtyId) => {
                                        const key = String(specialtyId);
                                        return specialtyMap.get(key) || key;
                                    })
                                    .filter(Boolean);
                                return (
                                    <TableRow key={id}>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <p className="font-semibold">{name}</p>
                                                <p className="text-xs text-foreground/60">{doctor.identifier}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <p className="text-sm text-foreground/70">
                                                {labels.length > 0 ? labels.join(', ') : 'Aucune'}
                                            </p>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-2">
                                                <Button size="sm" variant="flat" onPress={() => openEdit(doctor)}>
                                                    Modifier
                                                </Button>
                                                <Button size="sm" color="danger" variant="flat" onPress={() => confirmDelete(doctor)}>
                                                    Supprimer
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </div>

            <Modal isOpen={modalOpen} onClose={closeModal} backdrop="blur" size="lg">
                <ModalContent>
                    <ModalHeader>{editing ? 'Modifier un compte' : 'Nouveau compte'}</ModalHeader>
                    <ModalBody className="space-y-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Input
                                label="Prenom"
                                value={form.firstName}
                                onValueChange={(value) => setForm({ ...form, firstName: value })}
                            />
                            <Input
                                label="Nom"
                                value={form.lastName}
                                onValueChange={(value) => setForm({ ...form, lastName: value })}
                            />
                        </div>
                        <Input
                            label="Identifiant"
                            value={form.identifier}
                            onValueChange={(value) => setForm({ ...form, identifier: value })}
                            isRequired
                        />
                        <Input
                            label="Mot de passe"
                            type="password"
                            value={form.password}
                            onValueChange={(value) => setForm({ ...form, password: value })}
                            isRequired={!editing}
                        />
                        <Select
                            label="Specialites"
                            selectionMode="multiple"
                            selectedKeys={new Set(form.specialtyIds)}
                            onSelectionChange={(keys) => {
                                if (keys === 'all') {
                                    setForm({ ...form, specialtyIds: specialties.map((item) => item.id) });
                                    return;
                                }
                                setForm({ ...form, specialtyIds: Array.from(keys).map(String) });
                            }}
                            isDisabled={specialties.length === 0}
                        >
                            {specialties.map((specialty) => (
                                <SelectItem key={specialty.id} value={specialty.id}>
                                    {specialty.label}
                                </SelectItem>
                            ))}
                        </Select>
                        {specialties.length === 0 ? (
                            <p className="text-xs text-foreground/60">
                                Aucune specialite chargee. Ajoutez des calendriers de specialite pour les rendre visibles.
                            </p>
                        ) : null}
                        <Select
                            label="Roles"
                            selectionMode="multiple"
                            selectedKeys={new Set(form.roles)}
                            onSelectionChange={(keys) => {
                                if (keys === 'all') {
                                    setForm({ ...form, roles: ['doctor', 'admin'] });
                                    return;
                                }
                                setForm({ ...form, roles: Array.from(keys).map(String) });
                            }}
                        >
                            <SelectItem key="doctor" value="doctor">
                                doctor
                            </SelectItem>
                            <SelectItem key="admin" value="admin">
                                admin
                            </SelectItem>
                        </Select>
                        <Switch isSelected={form.isActive} onValueChange={(value) => setForm({ ...form, isActive: value })}>
                            Actif
                        </Switch>
                    </ModalBody>
                    <ModalFooter className="gap-2">
                        <Button variant="light" onPress={closeModal}>
                            Annuler
                        </Button>
                        <Button color="primary" onPress={handleSave} isLoading={saving}>
                            Enregistrer
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <ConfirmDialog
                isOpen={deleteOpen}
                title="Supprimer le compte"
                description="Confirmez la suppression du compte selectionne."
                confirmLabel="Supprimer"
                confirmColor="danger"
                isLoading={deleting}
                onClose={() => setDeleteOpen(false)}
                onConfirm={handleDelete}
            />
        </AdminLayout>
    );
};

export default DoctorsIndex;
