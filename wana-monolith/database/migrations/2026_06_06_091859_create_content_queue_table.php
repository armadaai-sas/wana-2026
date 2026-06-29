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
        Schema::create('content_queue', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('property_id')->nullable();
            $table->text('file_url');
            $table->text('file_path')->nullable();
            $table->text('caption')->nullable();
            $table->enum('status', ['PENDING', 'APPROVED', 'REJECTED'])->default('PENDING');
            $table->uuid('reviewer_id')->nullable();
            $table->uuid('uploaded_by')->nullable();
            $table->timestamps();
            
            // Indexes for performance (matching Supabase schema)
            $table->index('status');
            $table->index('created_at');
            $table->index('property_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('content_queue');
    }
};
