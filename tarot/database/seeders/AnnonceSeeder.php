<?php

namespace Database\Seeders;

use App\Models\Annonce;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AnnonceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Annonce::create([
            'name' => 'Petite',
            'multiplicateur' => 1,
            'color' => '#40f4fb',
        ]);
        Annonce::create([
            'name' => 'Garde',
            'multiplicateur' => 2,
            'color' => '#02f69a',
        ]);
        Annonce::create([
            'name' => 'Garde Sans',
            'multiplicateur' => 4,
            'color' => '#027bf6',
        ]);
        Annonce::create([
            'name' => 'Garde Contre',
            'multiplicateur' => 8,
            'color' => '#9c2bf8',
        ]);
    }
}
