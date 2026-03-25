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
        Schema::create('committee_roles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('committee_id')->constrained()->onDelete('cascade');
            $table->foreignId('member_id')->constrained()->onDelete('cascade');
            
            // The 17 specific roles
            $table->string('designation', 100); 
            
            $table->date('assigned_date')->nullable();
            $table->enum('status', ['active', 'resigned', 'removed'])->default('active');
            $table->timestamps();

            // A member can only hold a specific role once per committee at the same time
            $table->unique(['committee_id', 'member_id', 'designation', 'status'], 'committee_member_role_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('committee_roles');
    }
};
