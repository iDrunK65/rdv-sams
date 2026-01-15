import { FormEvent, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button, Input } from '@heroui/react';

import { PublicLayout } from '@/Layouts/PublicLayout';
import { patientApi } from '@/lib/api';
import type { ApiResponse, PatientTokenContext } from '@/lib/types';
import { savePatientContext } from '@/lib/patient';
import { useToast } from '@/hooks/useToast';

const TokenAccess = () => {
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const { error, success } = useToast();

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!token) return;

        setLoading(true);
        try {
            const response = await patientApi.validateToken({ token });
            const data = (response.data as ApiResponse<PatientTokenContext>).data;
            savePatientContext(data);
            success('Token valide');
            router.visit('/prise-rdv');
        } catch {
            error('Token invalide ou expire');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PublicLayout
            rightSlot={
                <Link href="/login" className="text-sm text-neutral-400 hover:text-white">
                    Acces medecin
                </Link>
            }
        >
            <Head title="Acces patient" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-semibold text-white">
                        Bienvenue sur notre plateforme de RDV medical
                    </h1>
                    <p className="mt-2 text-sm text-neutral-400">Saisissez votre token temporaire.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Token"
                        value={token}
                        onValueChange={setToken}
                        isRequired
                        placeholder="Entrer le token recu"
                    />
                    <Button color="primary" type="submit" isLoading={loading} className="w-full">
                        Acceder
                    </Button>
                </form>
            </div>
        </PublicLayout>
    );
};

export default TokenAccess;
