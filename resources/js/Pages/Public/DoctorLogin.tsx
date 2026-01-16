import { FormEvent, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Button, Input } from '@heroui/react';

import { PublicLayout } from '@/Layouts/PublicLayout';
import { authApi } from '@/lib/api';
import { useToast } from '@/hooks/useToast';

const DoctorLogin = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { error } = useToast();

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setLoading(true);
        try {
            await authApi.csrf();
            await authApi.login({ identifier, password });
            router.visit('/dashboard');
        } catch {
            error('Identifiants invalides');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PublicLayout>
            <Head title="Connexion medecin" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-semibold text-sams-text">Connectez vous sur votre espace medecin</h1>
                    <p className="mt-2 text-sm text-sams-muted">Entrez vos identifiants.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Identifiant" value={identifier} onValueChange={setIdentifier} isRequired />
                    <Input
                        label="Mot de passe"
                        type="password"
                        value={password}
                        onValueChange={setPassword}
                        isRequired
                    />
                    <Button color="primary" type="submit" isLoading={loading} className="w-full">
                        Se connecter
                    </Button>
                </form>
            </div>
        </PublicLayout>
    );
};

export default DoctorLogin;
