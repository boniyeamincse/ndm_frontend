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
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action', 100);                     // e.g. 'member.approved'
            $table->string('model_type', 100)->nullable();     // e.g. 'App\Models\Member'
            $table->unsignedBigInteger('model_id')->nullable(); // PK of the affected record
            $table->json('old_values')->nullable();            // data before change
            $table->json('new_values')->nullable();            // data after change
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('performed_at')->useCurrent();
            $table->index(['model_type', 'model_id']);
            $table->index('user_id');
            $table->index('action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
