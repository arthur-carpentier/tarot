<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Bonus;
use App\Models\Game;
use Illuminate\Support\Facades\DB;

class GameController extends Controller
{

    public function store(Request $request)
    {
        $validated = $request->validate([
            'annonce_id' => 'required|integer',
            'preneur' => 'required|integer',
            'roi' => 'required|integer',
            'defense' => 'required|array|',
            'nb_bouts' => 'required|integer|min:0|max:3',
            'nb_points' => 'required|numeric|min:1',
            'points_for' => 'required|string',
            'bonuses' => 'array',
            'enculette' => 'required|boolean',
        ]);
        $pointsForAttaque = $validated['points_for'] == 'attaque' ? true : false;

        $game = Game::create(
            [
                'annonce_id' => $validated['annonce_id'],
                'nb_bouts' => $validated['nb_bouts'],
                'nb_points' => $validated['nb_points'],
                'pointsForAttaque' => $pointsForAttaque,
                'enculette' => $validated['enculette']
            ]
        );
        // Attach the preneur (not roi)
        $game->attaquants()->attach($validated['preneur'], ['roi' => false]);

        // Attach the roi
        $game->attaquants()->attach($validated['roi'], ['roi' => true]);

        foreach ($validated['defense'] as $defenseur) {
            $game->defenseurs()->attach($defenseur);
        }

        return response()->json($game, 201);
    }

    public function list()
    {
        $games = Game::with(['attaquants', 'defenseurs', 'annonce'])->get();

        if ($games->isEmpty()) {
            return response()->json([], 204);
        }

        return response()->json($games, 200);
    }

    public function chart()
    {
        $chart = DB::table('cumulated_scores')
            ->join('players', 'cumulated_scores.player_id', '=', 'players.id')
            ->select('cumulated_scores.*', 'players.*')
            ->groupBy('cumulated_scores.player_id')
            ->get();

        return response()->json($chart);
    }
}
