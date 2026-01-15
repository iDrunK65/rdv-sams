import { Head } from '@inertiajs/react';

import { EmptyState } from '@/Components/ui/EmptyState';
import { PageHeader } from '@/Components/ui/PageHeader';
import { AdminLayout } from '@/Layouts/AdminLayout';

const SpecialtiesIndex = () => {
    return (
        <AdminLayout>
            <Head title="Specialites" />
            <div className="space-y-6">
                <PageHeader title="Specialites" subtitle="Gerez la liste des specialites." />
                <EmptyState
                    title="Module indisponible"
                    description="Le module specialites n est pas encore connecte."
                />
            </div>
        </AdminLayout>
    );
};

export default SpecialtiesIndex;
