<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('members', function (Blueprint $table) {
            if (!Schema::hasColumn('members', 'emergency_contact_name')) {
                $table->string('emergency_contact_name')->nullable()->after('permanent_address');
            }
            if (!Schema::hasColumn('members', 'emergency_contact_phone')) {
                $table->string('emergency_contact_phone')->nullable()->after('emergency_contact_name');
            }
            if (!Schema::hasColumn('members', 'skills')) {
                $table->text('skills')->nullable()->after('session');
            }
            if (!Schema::hasColumn('members', 'nid_doc_path')) {
                $table->string('nid_doc_path')->nullable()->after('photo_path');
            }
            if (!Schema::hasColumn('members', 'student_id_doc_path')) {
                $table->string('student_id_doc_path')->nullable()->after('nid_doc_path');
            }
        });

        // Use raw SQL to avoid doctrine/dbal dependency for column changes on some DB versions
        \Illuminate\Support\Facades\DB::statement('ALTER TABLE members MODIFY nid_or_bc TEXT');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->dropColumn([
                'emergency_contact_name', 
                'emergency_contact_phone', 
                'skills', 
                'nid_doc_path', 
                'student_id_doc_path'
            ]);
        });
    }
};
