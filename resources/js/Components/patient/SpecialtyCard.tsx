import { Button, Card, CardBody } from '@heroui/react';

import type { Calendar } from '@/lib/types';

type SpecialtyCardProps = {
    calendar: Calendar;
    onSelect: () => void;
};

export const SpecialtyCard = ({ calendar, onSelect }: SpecialtyCardProps) => {
    return (
        <Card className="border border-white/10 bg-white/5">
            <CardBody className="flex flex-col gap-3">
                <div>
                    <p className="text-sm text-foreground/70">Specialite</p>
                    <h3 className="text-lg font-semibold">{calendar.label || 'Calendrier specialite'}</h3>
                </div>
                <Button variant="flat" onPress={onSelect}>
                    Voir les creneaux
                </Button>
            </CardBody>
        </Card>
    );
};
