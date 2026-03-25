<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->string('division')->nullable()->after('permanent_address');
            $table->string('district')->nullable()->after('division');
            $table->string('upazila')->nullable()->after('district');
            $table->string('union')->nullable()->after('upazila');
            $table->string('ward')->nullable()->after('union');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->dropColumn(['division', 'district', 'upazila', 'union', 'ward']);
        });
    }
};
