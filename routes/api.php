<?php

use App\Http\Controllers\AnnonceController;
use App\Http\Controllers\BonusController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\PlayerController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/games', [GameController::class, 'store']);
Route::get('/games', [GameController::class, 'list']);
Route::get('/chart', [GameController::class, 'chart']);

Route::get('/players', [PlayerController::class, 'list']);
Route::post('/player/update/{id}', [PlayerController::class, 'update']);
Route::post('/player/create', [PlayerController::class, 'store']);

Route::get('/annonces', [AnnonceController::class, 'index']);
Route::post('/annonce/store', [AnnonceController::class, 'store']);
Route::post('/annonce/update/{id}', [AnnonceController::class, 'update']);

Route::get('/bonuses', [BonusController::class, 'index']);
Route::post('/bonus/store', [BonusController::class, 'store']);
Route::post('/bonus/update/{id}', [BonusController::class, 'update']);
