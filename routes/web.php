<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn () => Inertia::render('Public/TokenAccess'));
Route::get('/login', fn () => Inertia::render('Public/DoctorLogin'));

Route::middleware('patient.web')->group(function () {
    Route::get('/prise-rdv', fn () => Inertia::render('Patient/AppointmentHome'));
    Route::get('/prise-rdv/{calendarId}', fn (string $calendarId) => Inertia::render('Patient/AppointmentCalendar', [
        'calendarId' => $calendarId,
    ]));
});

Route::prefix('dashboard')->middleware('dashboard.auth')->group(function () {
    Route::get('/', fn () => Inertia::render('Dashboard/Home'));
    Route::get('config/{calendarId}', fn (string $calendarId) => Inertia::render('Dashboard/CalendarConfig', [
        'calendarId' => $calendarId,
    ]));
    Route::get('config/{calendarId}/rules', fn (string $calendarId) => Inertia::render('Dashboard/Availability/Rules', [
        'calendarId' => $calendarId,
    ]));
    Route::get('config/{calendarId}/exceptions', fn (string $calendarId) => Inertia::render('Dashboard/Availability/Exceptions', [
        'calendarId' => $calendarId,
    ]));
    Route::get('config/{calendarId}/appointment-types', fn (string $calendarId) => Inertia::render('Dashboard/AppointmentTypes/Index', [
        'calendarId' => $calendarId,
    ]));
    Route::get('calendriers', fn () => Inertia::render('Dashboard/DoctorsCalendars'));

    Route::prefix('admin')->middleware('admin.web')->group(function () {
        Route::get('/', fn () => Inertia::render('Admin/Home'));
        Route::get('comptes', fn () => Inertia::render('Admin/Accounts'));
        Route::get('calendrier-sams', fn () => Inertia::render('Admin/SamsCalendar'));
        Route::get('specialites', fn () => Inertia::render('Admin/Specialties'));
    });
});
