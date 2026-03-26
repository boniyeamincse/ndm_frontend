<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->date('membership_expires_at')->nullable()->after('approved_at')->index();
            $table->date('last_renewed_at')->nullable()->after('membership_expires_at');
        });
    }

    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->dropColumn(['membership_expires_at', 'last_renewed_at']);
        });
    }
};