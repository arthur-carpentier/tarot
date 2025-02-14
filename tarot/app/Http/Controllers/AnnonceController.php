<?php

namespace App\Http\Controllers;

use App\Models\Annonce;

class AnnonceController extends Controller
{
    public function index()
    {
        return response()->json(Annonce::orderBy('multiplicateur', 'asc')->get());
    }
}
