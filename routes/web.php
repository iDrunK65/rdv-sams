<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn () => Inertia::render('Patient/TokenLogin'));
Route::get('/login', fn () => Inertia::render('Dashboard/Login'));

Route::middleware('patient.web')->group(function () {
    Route::get('/prise-rdv', fn () => Inertia::render('Patient/DoctorShow'));
    Route::get('/prise-rdv/{calendarId}', fn (string $calendarId) => Inertia::render('Patient/Booking', [
        'calendarId' => $calendarId,
    ]));
});

Route::prefix('dashboard')->middleware('dashboard.auth')->group(function () {
    Route::get('/', fn () => Inertia::render('Dashboard/Calendar/Index'));
    Route::get('config/{calendarId}', fn (string $calendarId) => Inertia::render('Dashboard/Calendars/Show', [
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
    Route::get('calendriers', fn () => Inertia::render('Dashboard/Calendars/Index'));

    Route::prefix('admin')->middleware('admin.web')->group(function () {
        Route::get('/', fn () => Inertia::render('Admin/Dashboard'));
        Route::get('comptes', fn () => Inertia::render('Admin/Doctors/Index'));
        Route::get('comptes/create', fn () => Inertia::render('Admin/Doctors/Create'));
        Route::get('comptes/{id}/edit', fn (string $id) => Inertia::render('Admin/Doctors/Edit', [
            'id' => $id,
        ]));
        Route::get('calendrier-sams', fn () => Inertia::render('Admin/Sams/Index'));
        Route::get('calendrier-sams/create', fn () => Inertia::render('Admin/Sams/Create'));
        Route::get('calendrier-sams/{id}/edit', fn (string $id) => Inertia::render('Admin/Sams/Edit', [
            'id' => $id,
        ]));
        Route::get('specialites', fn () => Inertia::render('Admin/Specialties/Index'));
    });
});
