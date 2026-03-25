<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('member_positions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained()->cascadeOnDelete();
            $table->foreignId('role_id')->constrained();
            $table->foreignId('unit_id')->constrained('organizational_units');
            $table->foreignId('assigned_by')->constrained('users');
            $table->timestamp('assigned_at');
            $table->timestamp('relieved_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            // One person per role per unit at a time
            $table->unique(['role_id', 'unit_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('member_positions');
    }
};
