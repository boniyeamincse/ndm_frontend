<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('outreach_delivery_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('outreach_campaign_id')->constrained('outreach_campaigns')->cascadeOnDelete();
            $table->foreignId('member_id')->nullable()->constrained('members')->nullOnDelete();
            $table->foreignId('connector_id')->nullable()->constrained('communication_connectors')->nullOnDelete();
            $table->enum('channel', ['sms', 'whatsapp', 'email']);
            $table->string('status')->default('queued');
            $table->unsignedTinyInteger('attempt_count')->default(0);
            $table->text('failure_reason')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('opened_at')->nullable();
            $table->timestamp('clicked_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'channel']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('outreach_delivery_logs');
    }
};