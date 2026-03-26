<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('outreach_campaigns', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('subject')->nullable();
            $table->text('message_body');
            $table->enum('channel', ['sms', 'whatsapp', 'email']);
            $table->foreignId('audience_segment_id')->nullable()->constrained('audience_segments')->nullOnDelete();
            $table->json('custom_filters')->nullable();
            $table->json('template_meta')->nullable();
            $table->enum('status', ['draft', 'pending_approval', 'approved', 'scheduled', 'sending', 'sent', 'cancelled'])->default('draft');
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->unsignedInteger('recipient_estimate')->default(0);
            $table->unsignedInteger('sent_count')->default(0);
            $table->unsignedInteger('failed_count')->default(0);
            $table->unsignedInteger('opened_count')->default(0);
            $table->unsignedInteger('clicked_count')->default(0);
            $table->boolean('requires_approval')->default(true);
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['channel', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('outreach_campaigns');
    }
};