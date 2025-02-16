<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Bonus;

class BonusController extends Controller
{
    public function index()
    {
        return response()->json(Bonus::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'points' => 'required|integer|min:1',
        ]);

        $bonus = Bonus::create($validated);

        return response()->json($bonus, 201);
    }

    public function update(Request $request, $id)
    {
        $bonus = Bonus::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'points' => 'required|integer|min:1',
        ]);

        $bonus->update($validated);

        return response()->json($bonus);
    }

    public function destroy($id)
    {
        $bonus = Bonus::findOrFail($id);
        $bonus->delete();

        return response()->json(['message' => 'Bonus supprimé avec succès']);
    }
}
