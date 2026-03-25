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
        Schema::create('committees', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., "Dhaka District Central Committee"
            $table->enum('level', ['central', 'division', 'district', 'upazila', 'union', 'ward', 'institutional'])->index();
            $table->unsignedBigInteger('parent_id')->nullable()->index(); // Links to parent committee
            $table->enum('status', ['active', 'expired', 'dissolved'])->default('active');
            $table->date('established_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->timestamps();

            $table->foreign('parent_id')
                ->references('id')
                ->on('committees')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('committees');
    }
};
