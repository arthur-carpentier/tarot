<?php

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('LandingPage');
});
Route::get('/manage-players', function () {
    return Inertia::render('ManagePlayers');
});
Route::get('/manage-rules', function () {
    return Inertia::render('ManageRules');
});
Route::get('/new-game', function () {
    return Inertia::render('NewGame');
});
Route::get('/games', function () {
    return Inertia::render('Games');
});
Route::get('/chart', function () {
    return Inertia::render('Chart');
});

Route::middleware([
    'auth:sanctum',
    config('jetstream.auth_session'),
    'verified',
])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');
});
