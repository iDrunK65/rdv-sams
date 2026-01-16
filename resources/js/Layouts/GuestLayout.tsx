import { ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardBody } from '@heroui/react';

type GuestLayoutProps = {
    children: ReactNode;
    headerAction?: ReactNode;
};

export const GuestLayout = ({ children, headerAction }: GuestLayoutProps) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-sams-bg via-sams-surface to-sams-surface2">
            <header className="border-b border-sams-border/70 bg-sams-surface/70 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <Link href="/" className="flex items-center gap-2 text-sams-text">
                        <img src="/Logo_SAMS.png" alt="SAMS" className="h-9 w-9 place-items-center rounded-full" />
                        <span className="text-lg font-semibold">SAMS</span>
                    </Link>
                    {headerAction ? <div className="text-sm text-sams-muted">{headerAction}</div> : null}
                </div>
            </header>
            <div className="mx-auto flex min-h-[calc(100vh-72px)] max-w-5xl items-center justify-center px-6 py-12">
                <Card className="w-full border border-sams-border bg-sams-surface/60 shadow-xl">
                    <CardBody className="p-8">{children}</CardBody>
                </Card>
            </div>
        </div>
    );
};
