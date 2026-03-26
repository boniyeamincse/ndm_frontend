<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('renewal_reminders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained('members')->cascadeOnDelete();
            $table->enum('channel', ['in_app', 'sms', 'whatsapp', 'email'])->index();
            $table->enum('reminder_type', ['pre_expiry', 'grace_period', 'final_expiry'])->index();
            $table->enum('delivery_status', ['queued', 'sent', 'failed'])->default('queued')->index();
            $table->timestamp('scheduled_for')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->text('failure_reason')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('renewal_reminders');
    }
};