import { ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardBody } from '@heroui/react';

type GuestLayoutProps = {
    children: ReactNode;
    headerAction?: ReactNode;
};

export const GuestLayout = ({ children, headerAction }: GuestLayoutProps) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-slate-900">
            <header className="border-b border-white/10 bg-black/40 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <Link href="/" className="flex items-center gap-2 text-white">
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-sm font-semibold">
                            S
                        </span>
                        <span className="text-lg font-semibold">SAMS</span>
                    </Link>
                    {headerAction ? <div className="text-sm text-foreground/70">{headerAction}</div> : null}
                </div>
            </header>
            <div className="mx-auto flex min-h-[calc(100vh-72px)] max-w-5xl items-center justify-center px-6 py-12">
                <Card className="w-full border border-white/10 bg-white/5 shadow-xl">
                    <CardBody className="p-8">{children}</CardBody>
                </Card>
            </div>
        </div>
    );
};
