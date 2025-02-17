<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('annonces', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->integer('multiplicateur')->check('multiplicateur >= 0 AND multiplicateur <= 32');
            $table->string('color')->default('#FFFFFF'); // Default color
            $table->timestamps();
        });

        Schema::create('games', function (Blueprint $table) {
            $table->id();
            $table->foreignId('annonce_id')->nullable()->constrained()->onDelete('set null');
            $table->integer('nb_bouts')->check('nb_bouts >= 0 AND nb_bouts <= 3')->nullable();
            $table->float('nb_points')->check('nb_points >= 0 AND nb_points <= 91')->nullable();
            $table->boolean('enculette');
            $table->boolean('pointsForAttaque')->nullable();
            $table->timestamps();
        });

        Schema::create('attaque', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_id')->constrained('games')->onDelete('cascade');
            $table->foreignId('player_id')->constrained('players')->onDelete('cascade');
            $table->boolean('roi');
            $table->timestamps();
        });

        Schema::create('defense', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_id')->constrained('games')->onDelete('cascade');
            $table->foreignId('player_id')->constrained('players')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('defense');
        Schema::dropIfExists('attaque');
        Schema::dropIfExists('games');
        Schema::dropIfExists('annonces');
    }
};
