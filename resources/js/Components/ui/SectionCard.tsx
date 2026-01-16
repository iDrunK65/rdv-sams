import { ReactNode } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/react';

type SectionCardProps = {
    title?: string;
    description?: string;
    children: ReactNode;
    actions?: ReactNode;
};

export const SectionCard = ({ title, description, actions, children }: SectionCardProps) => {
    return (
        <Card className="border border-sams-border bg-sams-surface">
            {(title || actions || description) && (
                <CardHeader className="flex w-full items-start justify-between gap-4">
                    <div>
                        {title ? <h3 className="text-lg font-semibold text-sams-text">{title}</h3> : null}
                        {description ? <p className="mt-1 text-sm text-sams-muted">{description}</p> : null}
                    </div>
                    {actions ? <div>{actions}</div> : null}
                </CardHeader>
            )}
            <CardBody className="space-y-4">{children}</CardBody>
        </Card>
    );
};
