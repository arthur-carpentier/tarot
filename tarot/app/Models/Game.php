<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    use HasFactory;

    protected $fillable = ['annonce_id', 'nb_bouts', 'nb_points', 'enculette'];

    public function attaquants()
    {
        return $this->belongsToMany(Player::class, 'attaque', 'game_id', 'player_id')
            ->withPivot('roi'); // Include the 'roi' column from the pivot table
    }

    public function defenseurs()
    {
        return $this->belongsToMany(Player::class, 'defense', 'game_id', 'player_id');
    }

    public function annonce()
    {
        return $this->belongsTo(Annonce::class, 'annonce_id');
    }
}
