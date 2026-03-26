<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('donations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('donation_campaign_id')->constrained('donation_campaigns')->cascadeOnDelete();
            $table->foreignId('member_id')->nullable()->constrained('members')->nullOnDelete();
            $table->string('donor_name');
            $table->string('donor_email')->nullable();
            $table->string('donor_mobile')->nullable();
            $table->decimal('amount', 15, 2);
            $table->string('payment_channel'); // Bkash, Nagad, Rocket, Bank, Cash
            $table->string('payment_reference')->nullable();
            $table->string('transaction_id')->nullable()->index();
            $table->enum('status', ['pending', 'verified', 'rejected'])->default('pending');
            $table->dateTime('verified_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('verification_note')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('donations');
    }
};
