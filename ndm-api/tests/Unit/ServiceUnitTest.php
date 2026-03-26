<?php

namespace Tests\Unit;

use App\Models\Member;
use App\Models\User;
use App\Services\AuditLogService;
use App\Services\DocumentUploadService;
use App\Services\IdCardService;
use App\Services\MemberIdService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Mockery;
use Tests\TestCase;

class ServiceUnitTest extends TestCase
{
    use RefreshDatabase;

    public function test_member_id_service_generates_expected_format(): void
    {
        $service = app(MemberIdService::class);

        $generated = $service->generate();

        $this->assertMatchesRegularExpression('/^NDM-SW-\d{4}-\d{4}$/', $generated);
    }

    public function test_member_id_service_increments_sequence_for_same_year(): void
    {
        $service = app(MemberIdService::class);

        $first = $service->generate();
        $second = $service->generate();

        $firstSeq = (int) substr($first, -4);
        $secondSeq = (int) substr($second, -4);

        $this->assertSame($firstSeq + 1, $secondSeq);
    }

    public function test_document_upload_service_uploads_valid_profile_photo_to_public_disk(): void
    {
        Storage::fake('public');

        $service = app(DocumentUploadService::class);
        $file = UploadedFile::fake()->image('avatar.jpg', 200, 200);

        $path = $service->upload($file, 'photos', 'profile', 'public');

        $this->assertStringStartsWith('photos/', $path);
        Storage::disk('public')->assertExists($path);
    }

    public function test_document_upload_service_rejects_invalid_profile_mime_type(): void
    {
        Storage::fake('public');

        $service = app(DocumentUploadService::class);
        $file = UploadedFile::fake()->create('malicious.pdf', 100, 'application/pdf');

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('is not allowed for [profile] uploads');

        $service->upload($file, 'photos', 'profile', 'public');
    }

    public function test_document_upload_service_rejects_oversized_profile_file(): void
    {
        Storage::fake('public');

        $service = app(DocumentUploadService::class);
        $file = UploadedFile::fake()->image('huge.jpg')->size(3000);

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('maximum size for [profile] uploads');

        $service->upload($file, 'photos', 'profile', 'public');
    }

    public function test_audit_log_service_creates_audit_entry_with_change_data(): void
    {
        $actor = User::factory()->create(['user_type' => 'admin']);
        $member = Member::factory()->create(['full_name' => 'Before Update']);

        $this->actingAs($actor);

        $service = app(AuditLogService::class);
        $service->log('member.updated', $member, ['full_name' => 'Before Update'], ['full_name' => 'After Update'], 'manual audit note');

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $actor->id,
            'action' => 'member.updated',
            'model_type' => Member::class,
            'model_id' => $member->id,
            'notes' => 'manual audit note',
        ]);
    }

    public function test_id_card_service_generates_pdf_with_expected_payload_composition(): void
    {
        Storage::fake('public');

        $member = Member::factory()->create([
            'member_id' => 'NDM-SW-2026-0001',
            'full_name' => 'Service Test Member',
            'photo_path' => 'photos/profile.jpg',
            'status' => 'active',
        ]);

        $capturedViewData = null;

        $pdfMock = Mockery::mock(\Barryvdh\DomPDF\PDF::class);
        $pdfMock->shouldReceive('setPaper')
            ->once()
            ->with([0, 0, 255, 153], 'landscape')
            ->andReturnSelf();

        Pdf::shouldReceive('loadView')
            ->once()
            ->with('pdf.id_card', Mockery::on(function (array $data) use ($member, &$capturedViewData) {
                $capturedViewData = $data;

                return $data['member']->id === $member->id
                    && isset($data['qrBase64'])
                    && isset($data['photoUrl'])
                    && isset($data['generatedAt']);
            }))
            ->andReturn($pdfMock);

        $service = app(IdCardService::class);
        $result = $service->generate($member);

        $this->assertSame($pdfMock, $result);
        $this->assertNotNull($capturedViewData);

        $decodedQrSvg = base64_decode($capturedViewData['qrBase64']);

        $this->assertNotFalse($decodedQrSvg);
        $this->assertSame($member->id, $capturedViewData['member']->id);
        $this->assertSame($member->member_id, $capturedViewData['member']->member_id);
        $this->assertSame(Storage::disk('public')->url('photos/profile.jpg'), $capturedViewData['photoUrl']);
        $this->assertMatchesRegularExpression('/^\d{2} [A-Za-z]{3} \d{4}$/', $capturedViewData['generatedAt']);
        $this->assertStringContainsString('<svg', strtolower($decodedQrSvg));
        $this->assertStringContainsString('svg', strtolower($decodedQrSvg));
    }
}
