import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button, Card, CardBody, Select, SelectItem, Spinner, Switch } from '@heroui/react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import type { DatesSetArg, EventClickArg, EventInput } from '@fullcalendar/core';

import { GenerateTokenModal } from '@/Components/dashboard/GenerateTokenModal';
import { TransferModal } from '@/Components/dashboard/TransferModal';
import { ConfirmDialog } from '@/Components/ui/ConfirmDialog';
import { PageHeader } from '@/Components/ui/PageHeader';
import { DashboardLayout } from '@/Layouts/DashboardLayout';
import { useIsAdmin } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { toIsoUtc } from '@/lib/date';
import type { ApiResponse, Appointment, Calendar, Doctor, SamsEvent } from '@/lib/types';
import { EventDrawer } from './EventDrawer';

const viewOptions = [
    { key: 'dayGridMonth', label: 'Mois' },
    { key: 'timeGridWeek', label: 'Semaine' },
    { key: 'timeGridDay', label: 'Jour' },
    { key: 'listWeek', label: 'Agenda' },
] as const;

type CalendarView = (typeof viewOptions)[number]['key'];
type Selection = 'all' | Set<string>;

type ViewRange = {
    start: Date;
    end: Date;
};

const getEventTextColor = (hexColor?: string | null) => {
    if (!hexColor || !hexColor.startsWith('#') || hexColor.length !== 7) {
        return '#0B0B0B';
    }

    const r = parseInt(hexColor.slice(1, 3), 16) / 255;
    const g = parseInt(hexColor.slice(3, 5), 16) / 255;
    const b = parseInt(hexColor.slice(5, 7), 16) / 255;
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    return luminance > 0.6 ? '#0B0B0B' : '#F8FAFC';
};

const CalendarIndex = () => {
    const isAdmin = useIsAdmin();
    const calendarRef = useRef<FullCalendar | null>(null);
    const [calendars, setCalendars] = useState<Calendar[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [samsEvents, setSamsEvents] = useState<SamsEvent[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [calendarIds, setCalendarIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [appointmentsLoading, setAppointmentsLoading] = useState(false);
    const [viewTitle, setViewTitle] = useState('');
    const [activeView, setActiveView] = useState<CalendarView>('timeGridWeek');
    const [viewRange, setViewRange] = useState<ViewRange | null>(null);
    const [includeSams, setIncludeSams] = useState(true);

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [tokenModalOpen, setTokenModalOpen] = useState(false);
    const [transferOpen, setTransferOpen] = useState(false);
    const [cancelOpen, setCancelOpen] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);

    const loadCalendars = useCallback(async () => {
        const response = await api.get<ApiResponse<Calendar[]>>('/api/calendars');
        setCalendars(response.data.data);
    }, []);

    const loadAppointments = useCallback(
        async (range: ViewRange) => {
            setAppointmentsLoading(true);
            try {
                const params: Record<string, string | string[]> = {
                    from: toIsoUtc(range.start),
                    to: toIsoUtc(range.end),
                };

                if (!isAdmin && calendarIds.length > 0) {
                    params.calendarIds = calendarIds;
                }

                const response = await api.get<ApiResponse<Appointment[]>>('/api/appointments', { params });
                setAppointments(response.data.data);
            } finally {
                setAppointmentsLoading(false);
            }
        },
        [calendarIds, isAdmin],
    );

    const loadDoctors = useCallback(async () => {
        const response = await api.get<ApiResponse<Doctor[]>>('/api/doctors');
        setDoctors(response.data.data);
    }, []);

    const loadSamsEvents = useCallback(async (range?: ViewRange | null) => {
        const params = range
            ? {
                  from: toIsoUtc(range.start),
                  to: toIsoUtc(range.end),
              }
            : undefined;
        const response = await api.get<ApiResponse<SamsEvent[]>>('/api/sams/events', { params });
        setSamsEvents(response.data.data);
    }, []);

    useEffect(() => {
        const boot = async () => {
            setLoading(true);
            try {
                await Promise.all([loadCalendars(), loadDoctors()]);
            } finally {
                setLoading(false);
            }
        };

        boot();
    }, [loadCalendars, loadDoctors, loadSamsEvents]);

    useEffect(() => {
        if (calendars.length === 0) return;
        setCalendarIds((current) => {
            if (current.length > 0) return current;
            return calendars
                .filter((calendar) => calendar.scope !== 'sams')
                .map((calendar) => calendar._id || calendar.id || '')
                .filter((id): id is string => Boolean(id));
        });
    }, [calendars]);

    useEffect(() => {
        if (!viewRange) return;
        loadAppointments(viewRange);
    }, [loadAppointments, viewRange]);

    useEffect(() => {
        if (!viewRange || !includeSams) return;
        loadSamsEvents(viewRange);
    }, [includeSams, loadSamsEvents, viewRange]);

    const appointmentById = useMemo(() => {
        return new Map(
            appointments
                .map((appointment) => [appointment._id || appointment.id || '', appointment])
                .filter(([id]) => Boolean(id)),
        );
    }, [appointments]);

    const calendarMap = useMemo(() => {
        return new Map(
            calendars
                .map((calendar) => [calendar._id || calendar.id || '', calendar])
                .filter(([id]) => Boolean(id)),
        );
    }, [calendars]);

    const filteredAppointments = useMemo(() => {
        if (calendarIds.length === 0) return [];
        const selection = new Set(calendarIds);
        return appointments.filter((appointment) => selection.has(appointment.calendarId));
    }, [appointments, calendarIds]);

    const appointmentEvents = useMemo<EventInput[]>(() => {
        return filteredAppointments.map((appointment) => {
            const id = appointment._id || appointment.id || '';
            const calendar = calendarMap.get(appointment.calendarId);
            const patientName = appointment.patient
                ? `${appointment.patient.firstname ?? ''} ${appointment.patient.lastname ?? ''}`.trim()
                : 'Patient';
            const title = calendar?.label ? `${patientName} - ${calendar.label}` : patientName;
            const color = calendar?.color || '#2563EB';

            return {
                id,
                title: title || 'RDV',
                start: appointment.startAt,
                end: appointment.endAt,
                backgroundColor: color,
                borderColor: color,
                textColor: getEventTextColor(color),
                extendedProps: { type: 'appointment' },
            };
        });
    }, [filteredAppointments, calendarMap]);

    const samsEventItems = useMemo<EventInput[]>(() => {
        if (!includeSams) return [];
        return samsEvents.map((event) => {
            const id = event._id || event.id || '';
            return {
                id: `sams-${id}`,
                title: event.title || 'SAMS',
                start: event.startAt,
                end: event.endAt,
                backgroundColor: '#94A3B8',
                borderColor: '#CBD5F5',
                textColor: '#0B0B0B',
                extendedProps: { type: 'sams' },
            };
        });
    }, [samsEvents, includeSams]);

    const events = useMemo<EventInput[]>(() => {
        return [...appointmentEvents, ...samsEventItems];
    }, [appointmentEvents, samsEventItems]);

    const handleDatesSet = (info: DatesSetArg) => {
        setViewTitle(info.view.title);
        setActiveView(info.view.type as CalendarView);
        setViewRange({ start: info.start, end: info.end });
    };

    const handleEventClick = (info: EventClickArg) => {
        if (info.event.extendedProps?.type === 'sams') return;
        const appointment = appointmentById.get(info.event.id);
        if (!appointment) return;
        setSelectedAppointment(appointment);
        setDrawerOpen(true);
    };

    const handleCalendarChange = (keys: Selection) => {
        if (keys === 'all') {
            const allIds = calendars
                .filter((calendar) => calendar.scope !== 'sams')
                .map((calendar) => calendar._id || calendar.id)
                .filter((id): id is string => Boolean(id));
            setCalendarIds(allIds);
            return;
        }

        setCalendarIds(Array.from(keys).map(String));
    };

    const handleNavigate = (direction: 'prev' | 'next' | 'today') => {
        const api = calendarRef.current?.getApi();
        if (!api) return;
        if (direction === 'prev') api.prev();
        if (direction === 'next') api.next();
        if (direction === 'today') api.today();
    };

    const handleViewChange = (view: CalendarView) => {
        calendarRef.current?.getApi()?.changeView(view);
    };

    const handleCancelAppointment = async () => {
        if (!selectedAppointment?._id && !selectedAppointment?.id) return;
        setCancelLoading(true);
        try {
            const id = selectedAppointment._id || selectedAppointment.id || '';
            await api.post(`/api/appointments/${id}/cancel`, {});
            setCancelOpen(false);
            if (viewRange) {
                await loadAppointments(viewRange);
            }
        } finally {
            setCancelLoading(false);
        }
    };

    const calendarCards = calendars.filter((calendar) => calendar.scope !== 'sams');

    return (
        <DashboardLayout>
            <Head title="Dashboard" />
            <div className="space-y-6">
                <PageHeader
                    title="Espace medecin"
                    subtitle="Consultez vos rendez-vous et generez des tokens patients."
                    actions={
                        <Button color="primary" onPress={() => setTokenModalOpen(true)}>
                            Generer un token
                        </Button>
                    }
                />

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Calendriers</h2>
                        <Button as={Link} href="/dashboard/calendriers" variant="flat" size="sm">
                            Vue globale
                        </Button>
                    </div>
                    {loading ? (
                        <Spinner />
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {calendarCards.map((calendar) => {
                                const id = calendar._id || calendar.id || '';
                                return (
                                    <Card key={id} className="border border-white/10 bg-white/5">
                                        <CardBody className="space-y-3">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-xs uppercase text-foreground/60">
                                                        {calendar.scope === 'doctor' ? 'Visite medicale' : 'Specialite'}
                                                    </p>
                                                    <h3 className="text-lg font-semibold">
                                                        {calendar.label || 'Calendrier'}
                                                    </h3>
                                                </div>
                                                {calendar.color ? (
                                                    <span
                                                        className="h-3 w-3 rounded-full"
                                                        style={{ backgroundColor: calendar.color }}
                                                    />
                                                ) : null}
                                            </div>
                                            <Button as={Link} href={`/dashboard/config/${id}`} variant="flat" size="sm">
                                                Configurer
                                            </Button>
                                        </CardBody>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="calendar-shell p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-1">
                            <p className="text-sm text-foreground/60">{viewTitle || 'Calendrier'}</p>
                            <div className="flex flex-wrap items-center gap-2">
                                <Button size="sm" variant="flat" onPress={() => handleNavigate('today')}>
                                    Aujourd hui
                                </Button>
                                <Button size="sm" variant="flat" onPress={() => handleNavigate('prev')}>
                                    Prec
                                </Button>
                                <Button size="sm" variant="flat" onPress={() => handleNavigate('next')}>
                                    Suiv
                                </Button>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <Select
                                label="Calendriers"
                                selectionMode="multiple"
                                selectedKeys={new Set(calendarIds)}
                                onSelectionChange={handleCalendarChange}
                                className="min-w-[220px]"
                            >
                                {calendarCards.map((calendar) => {
                                    const id = calendar._id || calendar.id || '';
                                    return (
                                        <SelectItem key={id} value={id}>
                                            {calendar.label ||
                                                (calendar.scope === 'doctor' ? 'Visite medicale' : 'Specialite')}
                                        </SelectItem>
                                    );
                                })}
                            </Select>
                            <Switch isSelected={includeSams} onValueChange={setIncludeSams} size="sm">
                                Afficher SAMS
                            </Switch>
                            <div className="flex flex-wrap gap-2">
                                {viewOptions.map((view) => (
                                    <Button
                                        key={view.key}
                                        size="sm"
                                        variant={activeView === view.key ? 'solid' : 'flat'}
                                        onPress={() => handleViewChange(view.key)}
                                    >
                                        {view.label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <Card className="mt-4 border border-white/10 bg-black/30">
                        <CardBody className="relative">
                            {appointmentsLoading ? (
                                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40">
                                    <Spinner />
                                </div>
                            ) : null}
                            <FullCalendar
                                ref={calendarRef}
                                plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                                initialView="timeGridWeek"
                                headerToolbar={false}
                                nowIndicator
                                height="auto"
                                expandRows
                                dayMaxEventRows={3}
                                slotMinTime="07:00:00"
                                slotMaxTime="20:00:00"
                                events={events}
                                eventClick={handleEventClick}
                                datesSet={handleDatesSet}
                            />
                        </CardBody>
                    </Card>
                </div>
            </div>

            <GenerateTokenModal
                isOpen={tokenModalOpen}
                calendars={calendarCards}
                onClose={() => setTokenModalOpen(false)}
            />

            <EventDrawer
                isOpen={drawerOpen}
                appointment={selectedAppointment}
                onClose={() => {
                    setDrawerOpen(false);
                    setSelectedAppointment(null);
                }}
                onTransfer={() => setTransferOpen(true)}
                onCancel={() => setCancelOpen(true)}
            />

            <TransferModal
                isOpen={transferOpen}
                appointmentId={selectedAppointment?._id || selectedAppointment?.id || null}
                doctors={doctors}
                onClose={() => setTransferOpen(false)}
                onTransferred={() => viewRange && loadAppointments(viewRange)}
            />

            <ConfirmDialog
                isOpen={cancelOpen}
                title="Annuler le rendez-vous"
                description="Confirmez l annulation du rendez-vous selectionne."
                confirmLabel="Annuler"
                confirmColor="danger"
                isLoading={cancelLoading}
                onClose={() => setCancelOpen(false)}
                onConfirm={handleCancelAppointment}
            />
        </DashboardLayout>
    );
};

export default CalendarIndex;
