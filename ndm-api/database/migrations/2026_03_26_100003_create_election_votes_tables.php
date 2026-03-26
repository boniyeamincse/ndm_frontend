<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Ballot secrecy design:
 *   - election_voter_receipts  → tracks WHO voted (prevents double-voting), no vote choice stored.
 *   - election_votes           → tracks WHAT was voted, carries a random vote_token linking back
 *                                to a receipt row for auditability but not directly exposing the voter.
 *
 * The vote_token is a UUID generated server-side.  An admin can cross-reference tokens only in a
 * formal dispute-resolution context requiring access to both tables simultaneously.
 */
return new class extends Migration
{
    public function up(): void
    {
        // Who has voted (one row per member per election)
        Schema::create('election_voter_receipts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('election_id')->index();
            $table->unsignedBigInteger('voter_member_id')->index();
            $table->uuid('vote_token')->unique(); // links to election_votes.vote_token
            $table->dateTime('cast_at');
            $table->string('ip_hash', 64)->nullable(); // SHA-256 of IP — not raw IP
            $table->timestamps();

            $table->unique(['election_id', 'voter_member_id']);

            $table->foreign('election_id')
                ->references('id')
                ->on('elections')
                ->onDelete('cascade');

            $table->foreign('voter_member_id')
                ->references('id')
                ->on('members')
                ->onDelete('cascade');
        });

        // What was voted (ballot choices, separated from voter identity)
        Schema::create('election_votes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('election_id')->index();
            $table->unsignedBigInteger('nomination_id')->index(); // which nominee received the vote
            $table->uuid('vote_token')->unique(); // matches election_voter_receipts.vote_token
            $table->timestamps();

            $table->foreign('election_id')
                ->references('id')
                ->on('elections')
                ->onDelete('cascade');

            $table->foreign('nomination_id')
                ->references('id')
                ->on('election_nominations')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('election_votes');
        Schema::dropIfExists('election_voter_receipts');
    }
};
