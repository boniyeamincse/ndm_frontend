<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leadership_pipelines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained('members')->cascadeOnDelete();
            $table->enum('competency_level', ['foundation', 'intermediate', 'advanced', 'strategic'])->default('foundation');
            $table->unsignedTinyInteger('readiness_score')->default(0);
            $table->string('mentorship_track')->nullable();
            $table->string('recommended_role')->nullable();
            $table->boolean('eligible_for_promotion')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique('member_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leadership_pipelines');
    }
};