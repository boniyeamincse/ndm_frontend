<?php

namespace Tests\Unit;

use App\Enums\CampaignStatus;
use App\Enums\EventStatus;
use App\Enums\MemberStatus;
use PHPUnit\Framework\TestCase;

class ExampleTest extends TestCase
{
    public function test_member_status_login_and_position_rules_are_active_only(): void
    {
        $this->assertTrue(MemberStatus::ACTIVE->canLogin());
        $this->assertTrue(MemberStatus::ACTIVE->canHoldPosition());

        $this->assertFalse(MemberStatus::PENDING->canLogin());
        $this->assertFalse(MemberStatus::SUSPENDED->canLogin());
        $this->assertFalse(MemberStatus::EXPELLED->canHoldPosition());
    }

    public function test_member_status_allowed_values_and_labels_are_consistent(): void
    {
        $allowed = MemberStatus::allowedValues();
        $selectMap = MemberStatus::toSelectMap();

        $this->assertSame(['pending', 'active', 'suspended', 'expelled'], $allowed);
        $this->assertSame($allowed, array_keys($selectMap));
        $this->assertSame('Pending Approval', $selectMap['pending']);
        $this->assertSame('Active Member', $selectMap['active']);
    }

    public function test_event_and_campaign_status_allowed_values_match_cases(): void
    {
        $this->assertSame(
            array_column(EventStatus::cases(), 'value'),
            EventStatus::allowedValues()
        );

        $this->assertSame(
            array_column(CampaignStatus::cases(), 'value'),
            CampaignStatus::allowedValues()
        );

        $this->assertSame('Published', EventStatus::PUBLISHED->label());
        $this->assertSame('Planned', CampaignStatus::PLANNED->label());
    }
}
