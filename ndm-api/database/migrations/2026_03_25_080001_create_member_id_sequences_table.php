<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('member_id_sequences', function (Blueprint $table) {
            $table->year('year')->primary();
            $table->unsignedInteger('last_seq')->default(0);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('member_id_sequences');
    }
};
