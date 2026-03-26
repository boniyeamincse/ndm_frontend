<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('election_nominations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('election_id')->index();
            $table->unsignedBigInteger('member_id')->index(); // candidate
            $table->unsignedBigInteger('proposer_id')->nullable()->index();
            $table->unsignedBigInteger('seconder_id')->nullable()->index();
            $table->string('position_title')->nullable();
            $table->text('candidate_statement')->nullable();
            $table->enum('status', [
                'pending',
                'approved',
                'rejected',
                'withdrawn',
            ])->default('pending')->index();
            $table->boolean('is_published')->default(false);
            $table->unsignedBigInteger('reviewed_by')->nullable();
            $table->dateTime('reviewed_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();

            $table->unique(['election_id', 'member_id']);

            $table->foreign('election_id')
                ->references('id')
                ->on('elections')
                ->onDelete('cascade');

            $table->foreign('member_id')
                ->references('id')
                ->on('members')
                ->onDelete('cascade');

            $table->foreign('proposer_id')
                ->references('id')
                ->on('members')
                ->onDelete('set null');

            $table->foreign('seconder_id')
                ->references('id')
                ->on('members')
                ->onDelete('set null');

            $table->foreign('reviewed_by')
                ->references('id')
                ->on('users')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('election_nominations');
    }
};
