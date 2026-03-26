<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('elections', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('election_type', [
                'central_committee',
                'unit_committee',
                'position_specific',
            ])->index();
            $table->unsignedBigInteger('scope_unit_id')->nullable()->index();
            $table->enum('status', [
                'draft',
                'nomination_open',
                'nomination_closed',
                'voting_open',
                'voting_closed',
                'result_published',
                'cancelled',
            ])->default('draft')->index();
            $table->unsignedSmallInteger('max_votes_per_member')->default(1);
            $table->unsignedSmallInteger('min_proposers')->default(1);
            $table->dateTime('nomination_start_at')->nullable();
            $table->dateTime('nomination_end_at')->nullable();
            $table->dateTime('voting_start_at')->nullable();
            $table->dateTime('voting_end_at')->nullable();
            $table->dateTime('result_published_at')->nullable();
            $table->unsignedBigInteger('created_by');
            $table->timestamps();

            $table->foreign('scope_unit_id')
                ->references('id')
                ->on('organizational_units')
                ->onDelete('set null');

            $table->foreign('created_by')
                ->references('id')
                ->on('users')
                ->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('elections');
    }
};
