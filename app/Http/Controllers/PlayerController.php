<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Player;
use Illuminate\Support\Facades\DB;
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
        $players = Player::select('players.id', 'players.name', 'players.color', 'players.photo')
            // Join with cumulated_scores to get the latest score and game info
            ->leftJoinSub(function ($query) {
                $query->select(
                        'cumulated_scores.player_id',
                        'cumulated_scores.cumulated_total_points',
                        'cumulated_scores.game_id',
                        'games.created_at'
                    )
                    ->from('cumulated_scores')
                    ->join('games', 'games.id', '=', 'cumulated_scores.game_id')
                    ->joinSub(function ($subQuery) {
                        // Find the latest game per player
                        $subQuery->selectRaw('MAX(games.created_at) AS latest_game_date, player_id')
                            ->from('cumulated_scores')
                            ->join('games', 'games.id', '=', 'cumulated_scores.game_id')
                            ->groupBy('player_id');
                    }, 'latest_game', function ($join) {
                        $join->on('cumulated_scores.player_id', '=', 'latest_game.player_id')
                             ->on('games.created_at', '=', 'latest_game.latest_game_date');
                    });
            }, 'latest_score', function ($join) {
                $join->on('players.id', '=', 'latest_score.player_id');
            })
            // Now join with previous score (last game before the latest game)
            ->leftJoinSub(function ($query) {
                $query->select(
                        'cumulated_scores.player_id',
                        'cumulated_scores.cumulated_total_points',
                        'cumulated_scores.game_id',
                        'games.created_at'
                    )
                    ->from('cumulated_scores')
                    ->join('games', 'games.id', '=', 'cumulated_scores.game_id')
                    ->joinSub(function ($subQuery) {
                        // Find the last game before the latest game
                        $subQuery->selectRaw('MAX(games.created_at) AS previous_game_date, player_id')
                            ->from('cumulated_scores')
                            ->join('games', 'games.id', '=', 'cumulated_scores.game_id')
                            ->where('games.created_at', '<', DB::raw('(SELECT MAX(games.created_at) FROM games)'))
                            ->groupBy('player_id');
                    }, 'previous_game', function ($join) {
                        $join->on('cumulated_scores.player_id', '=', 'previous_game.player_id')
                             ->on('games.created_at', '=', 'previous_game.previous_game_date');
                    });
            }, 'previous_score', function ($join) {
                $join->on('players.id', '=', 'previous_score.player_id');
            })
            ->selectRaw('
                players.id,
                players.name,
                players.color,
                players.photo,
                COALESCE(latest_score.cumulated_total_points, 0) as score,
                COALESCE(latest_score.cumulated_total_points, 0) - COALESCE(previous_score.cumulated_total_points, 0) as latest_evolution
            ')
            ->orderBy('players.name', 'asc')
            ->get();

        if ($players->isEmpty()) {
            return response()->json([], 204);
        }

        // Format score and latest_evolution to 1 decimal
        foreach ($players as $player) {
            $player->score = number_format($player->score ?? 0, 1); // Ensure 1 decimal place
            $player->latestEvolution = number_format($player->latest_evolution ?? 0, 1); // Ensure 1 decimal place
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
