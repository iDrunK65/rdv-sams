import { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Button, Card, CardBody, Spinner } from '@heroui/react';

import { PatientLayout } from '@/Layouts/PatientLayout';
import { VmCard } from '@/Components/patient/VmCard';
import { SpecialtyCard } from '@/Components/patient/SpecialtyCard';
import { api } from '@/lib/api';
import type { ApiResponse, Calendar, Doctor } from '@/lib/types';
import { getPatientContext } from '@/lib/patient';

const DoctorShow = () => {
    const context = getPatientContext();
    const doctorId = context?.doctorId || '';

    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [calendars, setCalendars] = useState<Calendar[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!doctorId) {
            setLoading(false);
            return;
        }

        const load = async () => {
            try {
                const [doctorRes, calendarsRes] = await Promise.all([
                    api.get<ApiResponse<Doctor>>(`/api/patient/doctors/${doctorId}`),
                    api.get<ApiResponse<Calendar[]>>(`/api/patient/doctors/${doctorId}/calendars`),
                ]);
                setDoctor(doctorRes.data.data);
                setCalendars(calendarsRes.data.data);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [doctorId]);

    const handleSelect = (calendarId: string) => {
        router.visit(`/prise-rdv/${calendarId}`);
    };

    if (!doctorId) {
        return (
            <PatientLayout>
                <Head title="Prise de RDV" />
                <Card className="border border-white/10 bg-white/5">
                    <CardBody className="space-y-3">
                        <p className="text-sm text-foreground/70">
                            Le token patient est manquant ou expire. Veuillez revenir a la page d acces.
                        </p>
                        <Button color="primary" onPress={() => router.visit('/')}>
                            Retour
                        </Button>
                    </CardBody>
                </Card>
            </PatientLayout>
        );
    }

    const vmCalendar = calendars.find((calendar) => calendar.scope === 'doctor') || null;
    const specialtyCalendars = calendars.filter((calendar) => calendar.scope === 'specialty');

    return (
        <PatientLayout>
            <Head title="Prise de RDV" />
            {loading ? (
                <div className="flex justify-center py-16">
                    <Spinner size="lg" />
                </div>
            ) : (
                <div className="space-y-6">
                    <Card className="border border-white/10 bg-white/5">
                        <CardBody>
                            <h2 className="text-xl font-semibold">{doctor?.name || doctor?.identifier}</h2>
                            <p className="text-sm text-foreground/70">
                                Choisissez un type de rendez-vous pour afficher les creneaux.
                            </p>
                        </CardBody>
                    </Card>

                    {vmCalendar ? (
                        <VmCard
                            calendar={vmCalendar}
                            onSelect={() => handleSelect(vmCalendar._id || vmCalendar.id || '')}
                        />
                    ) : null}

                    {specialtyCalendars.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2">
                            {specialtyCalendars.map((calendar) => (
                                <SpecialtyCard
                                    key={calendar._id || calendar.id}
                                    calendar={calendar}
                                    onSelect={() => handleSelect(calendar._id || calendar.id || '')}
                                />
                            ))}
                        </div>
                    ) : null}
                </div>
            )}
        </PatientLayout>
    );
};

export default DoctorShow;
