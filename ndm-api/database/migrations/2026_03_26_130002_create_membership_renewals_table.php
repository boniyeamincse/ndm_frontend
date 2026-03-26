<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('membership_renewals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained('members')->cascadeOnDelete();
            $table->unsignedSmallInteger('renewal_year')->index();
            $table->date('renewal_window_start')->nullable();
            $table->date('renewal_window_end')->nullable();
            $table->decimal('fee_amount', 10, 2)->nullable();
            $table->string('payment_reference')->nullable();
            $table->enum('status', ['submitted', 'approved', 'rejected', 'expired'])->default('submitted')->index();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->foreignId('processed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('admin_note')->nullable();
            $table->timestamps();

            $table->unique(['member_id', 'renewal_year']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('membership_renewals');
    }
};