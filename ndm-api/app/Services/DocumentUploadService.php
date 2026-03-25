<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Secure document + photo upload service.
 *
 * Security measures applied:
 *  - Re-validates MIME type via finfo (not extension)
 *  - Renames every file to a random UUID (prevents path traversal)
 *  - Enforces per-type max file sizes
 *  - Documents stored on private 'local' disk; photos on 'public'
 */
class DocumentUploadService
{
    private const ALLOWED_MIMES = [
        'profile' => ['image/jpeg', 'image/png', 'image/webp'],
        'nid'     => ['image/jpeg', 'image/png', 'application/pdf'],
        'sid'     => ['image/jpeg', 'image/png', 'application/pdf'],
    ];

    private const MAX_SIZES = [
        'profile' => 2_097_152,  // 2 MB
        'nid'     => 5_242_880,  // 5 MB
        'sid'     => 5_242_880,  // 5 MB
    ];

    /**
     * Upload and store a file securely.
     *
     * @param  UploadedFile $file
     * @param  string       $folder  Storage subdirectory
     * @param  string       $type    'profile' | 'nid' | 'sid'
     * @param  string       $disk    'public' for photos, 'local' for docs
     * @return string  Stored path
     */
    public function upload(
        UploadedFile $file,
        string $folder,
        string $type,
        string $disk = 'public'
    ): string {
        $allowedMimes = self::ALLOWED_MIMES[$type] ?? null;
        if (! $allowedMimes) {
            throw new \InvalidArgumentException("Unknown document type: {$type}");
        }

        $realMime = $file->getMimeType(); // Laravel uses finfo internally
        if (! in_array($realMime, $allowedMimes, true)) {
            throw new \InvalidArgumentException(
                "File type [{$realMime}] is not allowed for [{$type}] uploads."
            );
        }

        if ($file->getSize() > (self::MAX_SIZES[$type] ?? PHP_INT_MAX)) {
            throw new \InvalidArgumentException(
                "File exceeds the maximum size for [{$type}] uploads."
            );
        }

        // Random UUID filename — never trust user-supplied names
        $extension = $file->guessExtension() ?? 'bin';
        $filename  = Str::uuid() . '.' . $extension;
        $path      = $file->storeAs($folder, $filename, $disk);

        if (! $path) {
            throw new \RuntimeException('File upload failed — storage rejected the file.');
        }

        return $path;
    }

    /**
     * Delete a stored file safely.
     */
    public function delete(?string $path, string $disk = 'public'): void
    {
        if ($path && Storage::disk($disk)->exists($path)) {
            Storage::disk($disk)->delete($path);
        }
    }

    /**
     * Return a public URL for a stored file.
     */
    public function url(?string $path, string $disk = 'public'): ?string
    {
        return $path ? Storage::disk($disk)->url($path) : null;
    }
}
