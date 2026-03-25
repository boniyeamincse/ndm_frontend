<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('position_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained('members');
            $table->foreignId('role_id')->constrained('roles');
            $table->foreignId('unit_id')->constrained('organizational_units');
            $table->enum('action', ['assigned','relieved','transferred']);
            $table->foreignId('performed_by')->constrained('users');
            $table->timestamp('performed_at');
            $table->text('remarks')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('position_history');
    }
};
