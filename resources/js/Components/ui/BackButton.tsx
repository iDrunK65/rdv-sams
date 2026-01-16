import { Button } from '@heroui/react';
import { Link, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

type BackButtonProps = {
    href?: string;
    label?: string;
    fallbackHref?: string;
};

export const BackButton = ({ href, label = 'Retour', fallbackHref }: BackButtonProps) => {
    const handleBack = () => {
        if (typeof window !== 'undefined' && window.history.length > 1) {
            window.history.back();
            return;
        }

        router.visit(fallbackHref ?? '/dashboard');
    };

    if (href) {
        return (
            <Button as={Link} href={href} variant="flat" size="sm" startContent={<ArrowLeft size={16} />}>
                {label}
            </Button>
        );
    }

    return (
        <Button variant="flat" size="sm" onPress={handleBack} startContent={<ArrowLeft size={16} />}>
            {label}
        </Button>
    );
};
