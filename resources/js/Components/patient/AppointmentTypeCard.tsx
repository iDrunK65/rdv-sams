import { ReactNode } from 'react';
import { Button, Card, CardBody } from '@heroui/react';

type AppointmentTypeCardProps = {
    title: string;
    description?: ReactNode;
    actionLabel?: string;
    onSelect: () => void;
};

export const AppointmentTypeCard = ({
    title,
    description,
    actionLabel = 'Choisir',
    onSelect,
}: AppointmentTypeCardProps) => {
    return (
        <Card className="border border-sams-border bg-sams-surface">
            <CardBody className="flex flex-col gap-3">
                <div>
                    <p className="text-lg font-semibold text-sams-text">{title}</p>
                    {description ? <div className="text-sm text-sams-muted">{description}</div> : null}
                </div>
                <Button color="primary" onPress={onSelect}>
                    {actionLabel}
                </Button>
            </CardBody>
        </Card>
    );
};
