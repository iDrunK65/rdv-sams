import { FormEvent, useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button, Card, CardBody, Spinner, Textarea } from '@heroui/react';

import { PageHeader } from '@/Components/ui/PageHeader';
import { SectionCard } from '@/Components/ui/SectionCard';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import { api } from '@/lib/api';
import type { ApiResponse, Calendar } from '@/lib/types';
import { useToast } from '@/hooks/useToast';

type CalendarShowProps = {
    calendarId: string;
};

const CalendarShow = ({ calendarId }: CalendarShowProps) => {
    const [calendar, setCalendar] = useState<Calendar | null>(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { success } = useToast();

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const response = await api.get<ApiResponse<Calendar[]>>('/api/calendars');
                const found = response.data.data.find(
                    (item) => (item._id || item.id) === calendarId,
                );
                setCalendar(found || null);
                setMessage(found?.message || '');
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [calendarId]);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!calendar) return;
        setSaving(true);
        try {
            await api.patch(`/api/calendars/${calendarId}/message`, { message });
            success('Message mis a jour');
        } finally {
            setSaving(false);
        }
    };

    return (
        <DashboardLayout>
            <Head title="Configuration calendrier" />
            <div className="space-y-6">
                <PageHeader
                    title="Configuration du calendrier"
                    subtitle="Gerez les parametres de ce calendrier."
                    actions={
                        <Button as={Link} href="/dashboard" variant="flat">
                            Retour dashboard
                        </Button>
                    }
                />

                {loading ? (
                    <Spinner />
                ) : (
                    <div className="space-y-6">
                        <Card className="border border-white/10 bg-white/5">
                            <CardBody className="space-y-2">
                                <p className="text-sm text-foreground/70">Calendrier</p>
                                <h2 className="text-xl font-semibold">{calendar?.label || calendar?.scope}</h2>
                                {calendar?.color ? (
                                    <div className="flex items-center gap-2 text-sm text-foreground/70">
                                        <span
                                            className="h-3 w-3 rounded-full"
                                            style={{ backgroundColor: calendar.color }}
                                        />
                                        Couleur actuelle
                                    </div>
                                ) : null}
                            </CardBody>
                        </Card>

                        <SectionCard
                            title="Disponibilites"
                            description="Definissez les heures disponibles et les exceptions."
                            actions={
                                <div className="flex gap-2">
                                    <Button as={Link} href={`/dashboard/config/${calendarId}/rules`} variant="flat" size="sm">
                                        Regles
                                    </Button>
                                    <Button
                                        as={Link}
                                        href={`/dashboard/config/${calendarId}/exceptions`}
                                        variant="flat"
                                        size="sm"
                                    >
                                        Exceptions
                                    </Button>
                                </div>
                            }
                        >
                            <p className="text-sm text-foreground/70">
                                Utilisez les regles pour definir les horaires de base et ajoutez des exceptions pour
                                ajuster un jour precis.
                            </p>
                        </SectionCard>

                        <SectionCard
                            title="Types de rendez-vous"
                            description="Duree, buffers et libelles."
                            actions={
                                <Button
                                    as={Link}
                                    href={`/dashboard/config/${calendarId}/appointment-types`}
                                    variant="flat"
                                    size="sm"
                                >
                                    Gerer
                                </Button>
                            }
                        >
                            <p className="text-sm text-foreground/70">
                                Configurez la duree et les buffers avant/apres pour les rendez-vous.
                            </p>
                        </SectionCard>

                        <SectionCard
                            title="Message patient"
                            description="Message envoye lors de la generation du token."
                        >
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Textarea
                                    label="Message template"
                                    value={message}
                                    onValueChange={setMessage}
                                    description="Utilisez {{TOKEN}} pour inserer le token."
                                />
                                <Button color="primary" type="submit" isLoading={saving}>
                                    Enregistrer
                                </Button>
                            </form>
                        </SectionCard>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default CalendarShow;
