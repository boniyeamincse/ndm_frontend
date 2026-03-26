<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('member_tasks', function (Blueprint $table) {
            $table->foreignId('campaign_id')->nullable()->after('parent_task_id')->constrained('campaigns')->nullOnDelete();
            $table->timestamp('escalation_at')->nullable()->after('due_date');
            $table->index(['campaign_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::table('member_tasks', function (Blueprint $table) {
            $table->dropIndex(['campaign_id', 'status']);
            $table->dropConstrainedForeignId('campaign_id');
            $table->dropColumn('escalation_at');
        });
    }
};