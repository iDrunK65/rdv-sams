import type { ComponentProps } from 'react';

import { EventDrawer } from '@/Pages/Dashboard/Calendar/EventDrawer';

type AppointmentDetailsDrawerProps = ComponentProps<typeof EventDrawer>;

export const AppointmentDetailsDrawer = (props: AppointmentDetailsDrawerProps) => {
    return <EventDrawer {...props} />;
};
