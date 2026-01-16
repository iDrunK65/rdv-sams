import { ReactNode } from 'react';
import { Card, CardBody } from '@heroui/react';

type EmptyStateProps = {
    title: string;
    description?: string;
    action?: ReactNode;
};

export const EmptyState = ({ title, description, action }: EmptyStateProps) => {
    return (
        <Card className="border border-sams-border bg-sams-surface/70">
            <CardBody className="flex flex-col items-start gap-2">
                <p className="text-base font-semibold text-sams-text">{title}</p>
                {description ? <p className="text-sm text-sams-muted">{description}</p> : null}
                {action ? <div className="pt-2">{action}</div> : null}
            </CardBody>
        </Card>
    );
};
