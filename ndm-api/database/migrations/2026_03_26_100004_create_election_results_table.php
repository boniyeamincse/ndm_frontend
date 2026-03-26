<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('election_results', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('election_id')->index();
            $table->unsignedBigInteger('nomination_id')->index();
            $table->unsignedInteger('vote_count')->default(0);
            $table->unsignedSmallInteger('rank'); // 1 = highest votes
            $table->boolean('is_winner')->default(false)->index();
            $table->string('tie_break_method')->nullable(); // e.g., 'lot', 'seniority', 'admin_decision'
            $table->text('notes')->nullable();
            $table->dateTime('declared_at')->nullable();
            $table->unsignedBigInteger('declared_by')->nullable();
            $table->timestamps();

            $table->unique(['election_id', 'nomination_id']);

            $table->foreign('election_id')
                ->references('id')
                ->on('elections')
                ->onDelete('cascade');

            $table->foreign('nomination_id')
                ->references('id')
                ->on('election_nominations')
                ->onDelete('cascade');

            $table->foreign('declared_by')
                ->references('id')
                ->on('users')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('election_results');
    }
};
