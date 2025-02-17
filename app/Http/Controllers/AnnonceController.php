<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Annonce;

class AnnonceController extends Controller
{
    public function index()
    {
        return response()->json(Annonce::orderBy('multiplicateur', 'asc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'required|string|max:7',
            'multiplicateur' => 'required|numeric|min:1',
        ]);

        $annonce = Annonce::create($validated);

        return response()->json($annonce, 201);
    }

    public function update(Request $request, $id)
    {
        $annonce = Annonce::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'required|string|max:7',
            'multiplicateur' => 'required|numeric|min:1',
        ]);

        $annonce->update($validated);
        $annonce->save();

        return response()->json($annonce);
    }

    public function destroy($id)
    {
        $annonce = Annonce::findOrFail($id);
        $annonce->delete();

        return response()->json(['message' => 'Annonce supprimée avec succès']);
    }
}
