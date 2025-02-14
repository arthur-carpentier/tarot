<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Player;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class PlayerController extends Controller
{
    public function store(Request $request)
    {
        // Validation
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'color' => 'required|string|max:7', // HEX color (#RRGGBB)
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Max 2048Ko
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Gestion de la photo
        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('players', 'public'); // Stocke dans storage/app/public/players
        }

        // Création du joueur
        $player = Player::create([
            'name' => $request->name,
            'color' => $request->color,
            'photo' => $photoPath,
        ]);

        return response()->json($player, 201);
    }

    public function list()
    {
        $players = Player::select('id', 'name', 'color', 'photo')->orderBy('name', 'asc')->get();

        if ($players->isEmpty()) {
            return response()->json([], 204);
        }

        return response()->json($players, 200);
    }

    public function update(Request $request, $id)
    {
        $player = Player::findOrFail($id);

        // Validation
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'color' => 'required|string|max:7',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Gestion de la photo
        if ($request->hasFile('photo')) {
            // Supprime l'ancienne photo si elle existe
            if ($player->photo) {
                Storage::disk('public')->delete($player->photo);
            }
            $player->photo = $request->file('photo')->store('players', 'public');
        }

        // Mise à jour
        $player->update([
            'name' => $request->name,
            'color' => $request->color,
            'photo' => $player->photo,
        ]);

        return response()->json($player, 200);
    }
}
