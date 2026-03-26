<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('outreach_retry_jobs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('outreach_delivery_log_id')->constrained('outreach_delivery_logs')->cascadeOnDelete();
            $table->unsignedTinyInteger('retry_number')->default(1);
            $table->timestamp('next_retry_at')->nullable();
            $table->string('status')->default('queued');
            $table->text('failure_reason')->nullable();
            $table->timestamps();

            $table->index(['status', 'next_retry_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('outreach_retry_jobs');
    }
};