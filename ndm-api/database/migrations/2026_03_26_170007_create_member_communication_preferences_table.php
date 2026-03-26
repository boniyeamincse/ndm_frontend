<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('member_communication_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained('members')->cascadeOnDelete();
            $table->boolean('sms_opt_in')->default(true);
            $table->boolean('whatsapp_opt_in')->default(true);
            $table->boolean('email_opt_in')->default(true);
            $table->timestamp('unsubscribed_at')->nullable();
            $table->string('unsubscribe_scope')->nullable();
            $table->text('unsubscribe_reason')->nullable();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique('member_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('member_communication_preferences');
    }
};