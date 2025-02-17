<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Bonus;
use App\Models\Game;
use Illuminate\Support\Facades\DB;

class GameController extends Controller
{
    public function statsData()
    {

        $playersQuery = "
            WITH latest_game AS (
                SELECT MAX(game_id) AS max_game_id FROM cumulated_scores
            ),
            ranked_players AS (
                SELECT
                    cs.player_id,
                    cs.cumulated_total_points AS finalScore,
                    p.name,
                    RANK() OVER (ORDER BY cs.cumulated_total_points DESC) AS ranking,
                    COUNT(*) OVER () AS total_players
                FROM cumulated_scores cs
                JOIN latest_game lg ON cs.game_id = lg.max_game_id
                JOIN players p ON cs.player_id = p.player_id
            ),
            selected_players AS (
                SELECT
                    player_id,
                    name,
                    finalScore,
                    ranking
                FROM ranked_players
                WHERE ranking IN (1, 2, 3)
                OR ranking = total_players
            ),
            player_wins_losses AS (
                SELECT
                    gs.player_id,
                    SUM(CASE WHEN gs.total_points > 0 THEN 1 ELSE 0 END) AS nbVictories,
                    SUM(CASE WHEN gs.total_points < 0 THEN 1 ELSE 0 END) AS nbLoss
                FROM game_scores gs
                JOIN selected_players sp ON gs.player_id = sp.player_id
                GROUP BY gs.player_id
            )
            SELECT
                sp.name,
                sp.finalScore,
                COALESCE(pw.nbVictories, 0) AS nbVictories,
                COALESCE(pw.nbLoss, 0) AS nbLoss,
                sp.ranking
            FROM selected_players sp
            LEFT JOIN player_wins_losses pw ON sp.player_id = pw.player_id
            ORDER BY sp.ranking;
        ";

        $players = DB::select($playersQuery);

        // Initialize variables
        $firstPlayerName = $secondPlayerName = $thirdPlayerName = $lastPlayerName = null;
        $firstPlayerFinalScore = $secondPlayerFinalScore = $thirdPlayerFinalScore = $lastPlayerFinalScore = 0;
        $firstPlayerNbVictories = $secondPlayerNbVictories = $thirdPlayerNbVictories = $lastPlayerNbVictories = 0;
        $firstPlayerNbLoss = $secondPlayerNbLoss = $thirdPlayerNbLoss = $lastPlayerNbLoss = 0;

        // Assign data to variables
        foreach ($players as $player) {
            switch ($player['ranking']) {
                case 1:
                    $firstPlayerName = $player['name'];
                    $firstPlayerFinalScore = $player['finalScore'];
                    $firstPlayerNbVictories = $player['nbVictories'];
                    $firstPlayerNbLoss = $player['nbLoss'];
                    break;
                case 2:
                    $secondPlayerName = $player['name'];
                    $secondPlayerFinalScore = $player['finalScore'];
                    $secondPlayerNbVictories = $player['nbVictories'];
                    $secondPlayerNbLoss = $player['nbLoss'];
                    break;
                case 3:
                    $thirdPlayerName = $player['name'];
                    $thirdPlayerFinalScore = $player['finalScore'];
                    $thirdPlayerNbVictories = $player['nbVictories'];
                    $thirdPlayerNbLoss = $player['nbLoss'];
                    break;
                default:
                    $lastPlayerName = $player['name'];
                    $lastPlayerFinalScore = $player['finalScore'];
                    $lastPlayerNbVictories = $player['nbVictories'];
                    $lastPlayerNbLoss = $player['nbLoss'];
                    break;
            }
        }

        $allTimeQuery = "
            WITH
            high_score AS (
                SELECT gs.player_id, gs.total_points, gs.game_id, p.name AS player_name, g.announce_id
                FROM game_scores gs
                JOIN players p ON gs.player_id = p.player_id
                JOIN games g ON gs.game_id = g.game_id
                ORDER BY gs.total_points DESC
                LIMIT 1
            ),
            low_score AS (
                SELECT gs.player_id, gs.total_points, gs.game_id, p.name AS player_name, g.announce_id
                FROM game_scores gs
                JOIN players p ON gs.player_id = p.player_id
                JOIN games g ON gs.game_id = g.game_id
                ORDER BY gs.total_points ASC
                LIMIT 1
            ),
            cumulative_scores AS (
                SELECT gs.player_id, p.name AS player_name, SUM(gs.total_points) AS cumulated_total_points
                FROM game_scores gs
                JOIN players p ON gs.player_id = p.player_id
                GROUP BY gs.player_id, p.name
            ),
            high_cumulative_score AS (
                SELECT player_id, player_name, cumulated_total_points
                FROM cumulative_scores
                ORDER BY cumulated_total_points DESC
                LIMIT 1
            ),
            low_cumulative_score AS (
                SELECT player_id, player_name, cumulated_total_points
                FROM cumulative_scores
                ORDER BY cumulated_total_points ASC
                LIMIT 1
            )
            SELECT
                hs.player_name AS ATHScoreName,
                hs.total_points AS ATHScoreValue,
                ha.name AS ATHWinAnnounce,
                ls.player_name AS ATLScoreName,
                ls.total_points AS ATLScoreValue,
                la.name AS ATHLossAnnounce,
                hcs.player_name AS ATCHighName,
                hcs.cumulated_total_points AS ATCHighValue,
                lcs.player_name AS ATCLowName,
                lcs.cumulated_total_points AS ATCLowValue
            FROM high_score hs
            JOIN announcements ha ON hs.announce_id = ha.announce_id
            JOIN low_score ls ON 1=1
            JOIN announcements la ON ls.announce_id = la.announce_id
            JOIN high_cumulative_score hcs ON 1=1
            JOIN low_cumulative_score lcs ON 1=1;";

        $allTimeResults = DB::select($allTimeQuery);

        // Assign All-Time High and Low Scores
        $ATHScoreName = $allTimeResults[0]->ATHScoreName ?? null;
        $ATHScoreValue = $allTimeResults[0]->ATHScoreValue ?? 0;
        $ATLScoreName = $allTimeResults[0]->ATLScoreName ?? null;
        $ATLScoreValue = $allTimeResults[0]->ATLScoreValue ?? 0;
        $ATHWinAnnounce = $allTimeResults[0]->ATHWinAnnounce ?? null;
        $ATHLossAnnounce = $allTimeResults[0]->ATHLossAnnounce ?? null;
        $ATCHighName = $allTimeResults[0]->ATCHighName ?? null;
        $ATCHighValue = $allTimeResults[0]->ATCHighValue ?? 0;
        $ATCLowName = $allTimeResults[0]->ATCLowName ?? null;
        $ATCLowValue = $allTimeResults[0]->ATCLowValue ?? 0;


        $statsData = [
            'firstPlayer' => [
                'name' => $firstPlayerName,
                'finalScore' => $firstPlayerFinalScore,
                'nbVictories' => $firstPlayerNbVictories,
                'nbLoss' => $firstPlayerNbLoss,
            ],
            'secondPlayer' => [
                'name' => $secondPlayerName,
                'finalScore' => $secondPlayerFinalScore,
                'nbVictories' => $secondPlayerNbVictories,
                'nbLoss' => $secondPlayerNbLoss,
            ],
            'thirdPlayer' => [
                'name' => $thirdPlayerName,
                'finalScore' => $thirdPlayerFinalScore,
                'nbVictories' => $thirdPlayerNbVictories,
                'nbLoss' => $thirdPlayerNbLoss,
            ],
            'lastPlayer' => [
                'name' => $lastPlayerName,
                'finalScore' => $lastPlayerFinalScore,
                'nbVictories' => $lastPlayerNbVictories,
                'nbLoss' => $lastPlayerNbLoss,
            ],
            'allTimeHighScore' => [
                'name' => $ATHScoreName,
                'score' => $ATHScoreValue,
            ],
            'allTimeLowScore' => [
                'name' => $ATLScoreName,
                'score' => $ATLScoreValue,
            ],
            'allTimeHighWin' => [
                'name' => $ATCHighName,
                'score' => $ATCHighValue,
                'announce' => $ATHWinAnnounce,
            ],
            'allTimeHighLoss' => [
                'name' => $ATCLowName,
                'score' => $ATCLowValue,
                'announce' => $ATHLossAnnounce,
            ],
            'highestAverageWin' => [
                'name' => $highestAverageWinPlayerName,
                'value' => $highestAverageWinValue,
            ],
            'highestAverageLoss' => [
                'name' => $highestAverageLossPlayerName,
                'value' => $highestAverageLossValue,
            ],
            'longestWinStreak' => [
                'name' => $longestWinStreakPlayerName,
                'length' => $longestWinStreakLength,
                'gain' => $longestWinStreakWin,
            ],
            'longestLoseStreak' => [
                'name' => $longestLoseStreakPlayerName,
                'length' => $longestLoseStreakLength,
                'loss' => $longestLoseStreakWin,
            ],
            'highestParticipation' => [
                'name' => $highestParticipationPlayerName,
                'value' => $highestParticipationAmount,
            ],
            'mostWins' => [
                'name' => $mostWinsPlayerName,
                'amount' => $mostWinsAmount,
            ],
            'mostLoss' => [
                'name' => $mostLossPlayerName,
                'amount' => $mostLossAmount,
            ],
            'mostVictorious' => [
                'name' => $mostVictoriousPlayerName,
                'amount' => $mostVictoriousPercentage,
            ],
            'mostDefeated' => [
                'name' => $mostDefeatedPlayerName,
                'amount' => $mostDefeatedPercentage,
            ],
            'bestDefender' => [
                'name' => $bestDefenderPlayerName,
                'amount' => $bestDefenderPercentage,
            ],
            'worstDefender' => [
                'name' => $worstDefenderPlayerName,
                'amount' => $worstDefenderPercentage,
            ],
            'bestAttacker' => [
                'name' => $bestAttackerPlayerName,
                'amount' => $bestAttackerPercentage,
            ],
            'worstAttacker' => [
                'name' => $worstAttackerPlayerName,
                'amount' => $worstAttackerPercentage,
            ],
            'mostDefender' => [
                'name' => $mostDefenderPlayerName,
                'amount' => $mostDefenderPercentage,
            ],
            'mostAttacker' => [
                'name' => $mostAttackerPlayerName,
                'amount' => $mostAttackerPercentage,
            ],
            'mostTaker' => [
                'name' => $mostTakerPlayerName,
                'amount' => $mostTakerPercentage,
            ],
            'mostMaintained' => [
                'name' => $mostMaintainedPlayerName,
                'amount' => $mostMaintainedPercentage,
            ],
            'mostSabotaged' => [
                'name' => $mostSabotagedPlayerName,
                'amount' => $mostSabotagedPercentage,
            ],
            'mostKing' => [
                'name' => $mostKingPlayerName,
                'amount' => $mostKingPercentage,
            ],
            'petite' => [
                'occurences' => $petiteOccurences,
                'percentageOccurences' => $petitePercentageOccurences,
                'victories' => $petiteVictories,
                'percentageVictories' => $petitePercentageVictories,
            ],
            'garde' => [
                'occurences' => $gardeOccurences,
                'percentageOccurences' => $gardePercentageOccurences,
                'victories' => $gardeVictories,
                'percentageVictories' => $gardePercentageVictories,
            ],
            'gardeSans' => [
                'occurences' => $gardeSansOccurences,
                'percentageOccurences' => $gardeSansPercentageOccurences,
                'victories' => $gardeSansVictories,
                'percentageVictories' => $gardeSansPercentageVictories,
            ],
            'gardeContre' => [
                'occurences' => $gardeContreOccurences,
                'percentageOccurences' => $gardeContrePercentageOccurences,
                'victories' => $gardeContreVictories,
                'percentageVictories' => $gardeContrePercentageVictories,
            ],
            'attack' => [
                'victories' => $attackVictories,
                'percentageVictories' => $attackPercentageVictories,
            ],
            'defense' => [
                'victories' => $defenseVictories,
                'percentageVictories' => $defensePercentageVictories,
            ]

        ];

        return response()->json($statsData, 200);
    }
}
