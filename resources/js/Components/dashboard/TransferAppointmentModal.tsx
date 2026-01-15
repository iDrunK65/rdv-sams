import type { ComponentProps } from 'react';

import { TransferModal } from '@/Components/dashboard/TransferModal';

type TransferAppointmentModalProps = ComponentProps<typeof TransferModal>;

export const TransferAppointmentModal = (props: TransferAppointmentModalProps) => {
    return <TransferModal {...props} />;
};
