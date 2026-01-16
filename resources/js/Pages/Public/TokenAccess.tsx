import { FormEvent, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button, Input } from '@heroui/react';
import type { AxiosError } from 'axios';

import { PublicLayout } from '@/Layouts/PublicLayout';
import { patientApi } from '@/lib/api';
import type { ApiError } from '@/lib/types';
import { useToast } from '@/hooks/useToast';

const TokenAccess = () => {
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [tokenError, setTokenError] = useState<string | null>(null);
    const { error, success } = useToast();

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        const trimmed = token.trim();
        if (!trimmed) return;
        if (trimmed.length !== 10) {
            const message = 'Le token doit contenir 10 caracteres.';
            setTokenError(message);
            error('Token invalide', message);
            return;
        }

        setLoading(true);
        setTokenError(null);
        try {
            await patientApi.validateToken({ token: trimmed });
            success('Token valide');
            router.visit('/prise-rdv');
        } catch (err) {
            const axiosError = err as AxiosError<ApiError>;
            if (axiosError.response?.status === 422) {
                const message = axiosError.response.data?.errors?.token?.[0] || 'Token invalide.';
                setTokenError(message);
                error('Token invalide', message);
                return;
            }
            error('Token invalide ou expiré');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PublicLayout
            rightSlot={
                <Link href="/login" className="text-sm text-sams-muted hover:text-sams-text">
                    Accès médecin
                </Link>
            }
        >
            <Head title="Accès patient" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-semibold text-sams-text">
                        Bienvenue sur notre plateforme de RDV médical SAMS
                    </h1>
                    <p className="mt-2 text-sm text-sams-muted">Saisissez votre token temporaire.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Token"
                        value={token}
                        onValueChange={(value) => {
                            setToken(value);
                            if (tokenError) setTokenError(null);
                        }}
                        isRequired
                        placeholder="Entrer le token reçu"
                        isInvalid={Boolean(tokenError)}
                        errorMessage={tokenError || undefined}
                    />
                    <Button color="primary" type="submit" isLoading={loading} className="w-full">
                        Accéder
                    </Button>
                </form>
            </div>
        </PublicLayout>
    );
};

export default TokenAccess;
