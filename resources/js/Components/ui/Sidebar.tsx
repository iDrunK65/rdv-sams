import { ReactNode } from 'react';
import { Link } from '@inertiajs/react';

type SidebarItem = {
    label: string;
    href: string;
};

type SidebarProps = {
    items: SidebarItem[];
    activePath: string;
    footer?: ReactNode;
};

export const Sidebar = ({ items, activePath, footer }: SidebarProps) => {
    return (
        <aside className="hidden w-64 flex-col border-r border-sams-border max-h-screen bg-sams-surface px-6 py-6 lg:flex">
            <Link href="/dashboard" className="flex items-center gap-2 text-sams-text">
                <img src="/Logo_SAMS.png" alt="SAMS" className="h-9 w-9 place-items-center rounded-full" />
                <span className="text-lg font-semibold">SAMS</span>
            </Link>
            <div className="my-6 h-px w-full bg-sams-border" />
            <nav className="space-y-2">
                {items.map((item) => {
                    const isActive = activePath === item.href || activePath.startsWith(`${item.href}/`);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center rounded-large px-3 py-2 text-sm transition ${
                                isActive ? 'bg-sams-surface2 text-sams-text' : 'text-sams-muted hover:bg-sams-surface2/60'
                            }`}
                        >
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
            {footer ? <div className="mt-auto pt-6">{footer}</div> : null}
        </aside>
    );
};
