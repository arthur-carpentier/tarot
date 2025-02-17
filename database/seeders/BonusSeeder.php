<?php

namespace Database\Seeders;

use App\Models\Bonus;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BonusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Bonus::create([
            'name' => 'Poignée',
            'points' => 20,
        ]);
        Bonus::create([
            'name' => 'Double-Poignée',
            'points' => 30,
        ]);
        Bonus::create([
            'name' => 'Triple-Poignée',
            'points' => 40,
        ]);
        Bonus::create([
            'name' => "Misère d'atout",
            'points' => 20,
        ]);
        Bonus::create([
            'name' => 'Misère de tête',
            'points' => 20,
        ]);
    }
}
