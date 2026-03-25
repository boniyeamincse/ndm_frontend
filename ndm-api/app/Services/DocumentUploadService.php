<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class DocumentUploadService
{
    /**
     * Upload a member document to secure storage.
     *
     * @param UploadedFile $file
     * @param string $folder
     * @param string|null $prefix
     * @return string
     */
    public function upload(UploadedFile $file, string $folder = 'documents', ?string $prefix = null): string
    {
        $filename = ($prefix ? $prefix . '_' : '') . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        
        return $file->storeAs($folder, $filename, 'public');
    }

    /**
     * Delete a document if it exists.
     *
     * @param string|null $path
     * @return void
     */
    public function delete(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }
}
