import { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Button, Card, CardBody, Spinner } from '@heroui/react';

import { AppointmentTypeCard } from '@/Components/patient/AppointmentTypeCard';
import { PatientLayout } from '@/Layouts/PatientLayout';
import { patientApi } from '@/lib/api';
import type { ApiResponse, Calendar, Doctor } from '@/lib/types';
import { getPatientDoctorId } from '@/lib/patient';

const AppointmentHome = () => {
    const doctorId = getPatientDoctorId() || '';
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
                    patientApi.getDoctor(doctorId),
                    patientApi.getCalendars(doctorId),
                ]);
                setDoctor((doctorRes.data as ApiResponse<Doctor>).data);
                setCalendars((calendarsRes.data as ApiResponse<Calendar[]>).data);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [doctorId]);

    if (!doctorId) {
        return (
            <PatientLayout>
                <Head title="Prise de RDV" />
                <Card className="border border-neutral-800 bg-neutral-900">
                    <CardBody className="space-y-3">
                        <p className="text-sm text-neutral-400">
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

    const handleSelect = (calendarId: string) => {
        router.visit(`/prise-rdv/${calendarId}`);
    };

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
                    <Card className="border border-neutral-800 bg-neutral-900">
                        <CardBody className="space-y-2">
                            <h2 className="text-xl font-semibold">
                                {doctor?.name || doctor?.identifier || 'Medecin'}
                            </h2>
                            <p className="text-sm text-neutral-400">
                                Choisissez un type de rendez-vous pour afficher les creneaux.
                            </p>
                        </CardBody>
                    </Card>

                    <div className="grid gap-4 md:grid-cols-2">
                        {vmCalendar ? (
                            <AppointmentTypeCard
                                title="Visite Medicale"
                                description={vmCalendar.label || 'Calendrier medecin'}
                                actionLabel="Choisir"
                                onSelect={() => handleSelect(vmCalendar._id || vmCalendar.id || '')}
                            />
                        ) : null}
                        {specialtyCalendars.map((calendar) => (
                            <AppointmentTypeCard
                                key={calendar._id || calendar.id}
                                title={calendar.label || 'Specialite'}
                                description="Consultation specialisee"
                                actionLabel="Choisir"
                                onSelect={() => handleSelect(calendar._id || calendar.id || '')}
                            />
                        ))}
                    </div>
                </div>
            )}
        </PatientLayout>
    );
};

export default AppointmentHome;
