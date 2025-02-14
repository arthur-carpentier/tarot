<?php

use App\Http\Controllers\AnnonceController;
use App\Http\Controllers\PlayerController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/list-players', [PlayerController::class, 'list']);
Route::post('/player/update/{id}', [PlayerController::class, 'update']);
Route::post('/player/create', [PlayerController::class, 'store']);
Route::get('/annonces', [AnnonceController::class, 'index']);
