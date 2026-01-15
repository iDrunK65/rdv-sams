import type { PatientTokenContext } from './types';

const KEY = 'patient_context';
const DOCTOR_KEY = 'patientDoctorId';

export const savePatientContext = (context: PatientTokenContext): void => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(KEY, JSON.stringify(context));
    if (context.doctorId) {
        sessionStorage.setItem(DOCTOR_KEY, context.doctorId);
    }
};

export const getPatientContext = (): PatientTokenContext | null => {
    if (typeof window === 'undefined') return null;
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;

    try {
        return JSON.parse(raw) as PatientTokenContext;
    } catch {
        return null;
    }
};

export const clearPatientContext = (): void => {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(KEY);
    sessionStorage.removeItem(DOCTOR_KEY);
};

export const getPatientDoctorId = (): string | null => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(DOCTOR_KEY);
};
