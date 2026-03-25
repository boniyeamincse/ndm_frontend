<?php

namespace Database\Seeders;

use App\Models\BlogPost;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class BlogPostSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (!Schema::hasTable('blog_posts')) {
            return;
        }

        $admin = User::where('email', 'admin@ndm.org.bd')->first();

        if (!$admin) {
            return;
        }

        $posts = [
            [
                'title' => 'NDM Launches National Campus Connect 2026',
                'slug' => 'ndm-launches-national-campus-connect-2026',
                'category' => 'Announcement',
                'excerpt' => 'A coordinated initiative to activate campus chapters and leadership circles across major universities.',
                'content' => 'NDMSTUDENT officially launched the National Campus Connect 2026 initiative with a focus on leadership development, policy literacy, and volunteer mobilization. Regional coordinators will host campus forums in phased rollout format, beginning with division-level pilot institutions and then expanding to district networks. The initiative includes mentor sessions, civic engagement workshops, and chapter capacity support.',
                'status' => 'published',
                'is_featured' => true,
                'published_at' => now()->subDays(4),
            ],
            [
                'title' => 'Volunteer Registration Open for Civic Impact Week',
                'slug' => 'volunteer-registration-open-for-civic-impact-week',
                'category' => 'Event',
                'excerpt' => 'Students can now register for district-level volunteer teams supporting social awareness campaigns.',
                'content' => 'NDMSTUDENT opens volunteer registration for Civic Impact Week. Participants will collaborate with local chapter committees to organize outreach activities, educational sessions, and service projects. Registered volunteers receive orientation materials, task guides, and team lead assignments through the chapter network.',
                'status' => 'published',
                'is_featured' => false,
                'published_at' => now()->subDays(2),
            ],
            [
                'title' => 'Media & Communications Handbook Draft',
                'slug' => 'media-and-communications-handbook-draft',
                'category' => 'Internal',
                'excerpt' => 'Draft guidelines for chapter communication standards are now available for review.',
                'content' => 'This draft outlines standard communication templates, social posting cadence, and event reporting checklists for chapter media leads. Feedback from central and campus coordinators will be incorporated in the final edition.',
                'status' => 'draft',
                'is_featured' => false,
                'published_at' => null,
            ],
        ];

        foreach ($posts as $post) {
            BlogPost::updateOrCreate(
                ['slug' => $post['slug']],
                [
                    ...$post,
                    'author_id' => $admin->id,
                ]
            );
        }
    }
}
