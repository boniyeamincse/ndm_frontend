<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_report_id')->constrained('event_reports')->cascadeOnDelete();
            $table->enum('media_type', ['image', 'video', 'document'])->index();
            $table->string('title')->nullable();
            $table->string('file_path');
            $table->text('caption')->nullable();
            $table->boolean('is_public')->default(false);
            $table->enum('moderation_status', ['pending', 'approved', 'rejected'])->default('pending')->index();
            $table->foreignId('uploaded_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_media');
    }
};