import { ReactNode } from 'react';
import { Divider } from '@heroui/react';

import { BackButton } from '@/Components/ui/BackButton';

type PageHeaderProps = {
    title: string;
    subtitle?: string;
    actions?: ReactNode;
    backHref?: string;
    backLabel?: string;
    fallbackHref?: string;
};

export const PageHeader = ({ title, subtitle, actions, backHref, backLabel, fallbackHref }: PageHeaderProps) => {
    const showBack = Boolean(backHref || fallbackHref);

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-start gap-3">
                    {showBack ? (
                        <BackButton href={backHref} fallbackHref={fallbackHref} label={backLabel} />
                    ) : null}
                    <div>
                        <h1 className="text-2xl font-semibold text-sams-text">{title}</h1>
                        {subtitle ? <p className="mt-1 text-sm text-sams-muted">{subtitle}</p> : null}
                    </div>
                </div>
                {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
            </div>
            <Divider className="bg-sams-border/70" />
        </div>
    );
};
