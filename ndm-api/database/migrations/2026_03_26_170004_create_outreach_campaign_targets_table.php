<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('outreach_campaign_targets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('outreach_campaign_id')->constrained('outreach_campaigns')->cascadeOnDelete();
            $table->foreignId('member_id')->constrained('members')->cascadeOnDelete();
            $table->string('resolved_channel_contact')->nullable();
            $table->boolean('consent_ok')->default(true);
            $table->timestamps();

            $table->unique(['outreach_campaign_id', 'member_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('outreach_campaign_targets');
    }
};