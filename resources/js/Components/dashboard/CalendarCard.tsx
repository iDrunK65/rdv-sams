import { Link } from '@inertiajs/react';
import { Button, Card, CardBody } from '@heroui/react';

import type { Calendar } from '@/lib/types';

type CalendarCardProps = {
    calendar: Calendar;
    href: string;
};

const getScopeLabel = (scope: Calendar['scope']) => {
    if (scope === 'doctor') return 'Visite medicale';
    if (scope === 'specialty') return 'Specialite';
    return 'SAMS';
};

export const CalendarCard = ({ calendar, href }: CalendarCardProps) => {
    return (
        <Card className="border border-neutral-800 bg-neutral-900">
            <CardBody className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-xs uppercase text-neutral-400">{getScopeLabel(calendar.scope)}</p>
                        <h3 className="text-lg font-semibold text-white">{calendar.label || 'Calendrier'}</h3>
                    </div>
                    {calendar.color ? (
                        <span className="mt-1 h-3 w-3 rounded-full" style={{ backgroundColor: calendar.color }} />
                    ) : null}
                </div>
                <Button as={Link} href={href} variant="flat" size="sm">
                    Configurer
                </Button>
            </CardBody>
        </Card>
    );
};
