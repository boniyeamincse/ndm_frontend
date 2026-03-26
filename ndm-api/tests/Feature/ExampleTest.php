<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_profile_endpoint_requires_authentication(): void
    {
        $response = $this->getJson('/api/profile');

        $response->assertStatus(401);
    }

    public function test_member_task_endpoint_requires_authentication(): void
    {
        $response = $this->getJson('/api/tasks/my');

        $response->assertStatus(401);
    }

    public function test_id_card_download_endpoint_requires_authentication(): void
    {
        $response = $this->getJson('/api/id-card');

        $response->assertStatus(401);
    }
}
