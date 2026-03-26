<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('communication_connectors', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('channel', ['sms', 'whatsapp', 'email']);
            $table->string('provider');
            $table->json('credentials')->nullable();
            $table->boolean('is_active')->default(true);
            $table->enum('health_status', ['healthy', 'degraded', 'down'])->default('healthy');
            $table->foreignId('fallback_connector_id')->nullable()->constrained('communication_connectors')->nullOnDelete();
            $table->timestamp('last_health_checked_at')->nullable();
            $table->timestamps();

            $table->index(['channel', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('communication_connectors');
    }
};