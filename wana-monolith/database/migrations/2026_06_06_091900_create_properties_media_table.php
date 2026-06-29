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
        Schema::create('properties_media', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('property_id')->nullable();
            $table->text('file_path')->nullable();
            $table->text('file_url')->nullable();
            $table->string('content_type')->nullable();
            $table->integer('size_bytes')->nullable();
            $table->uuid('uploaded_by')->nullable();
            $table->enum('status', ['PENDING', 'APPROVED', 'REJECTED'])->default('PENDING');
            $table->timestamps();
            
            // Indexes for performance
            $table->index('property_id');
            $table->index('status');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('properties_media');
    }
};
