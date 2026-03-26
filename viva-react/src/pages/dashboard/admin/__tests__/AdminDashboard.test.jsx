import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminDashboard from '../AdminDashboard';
import api from '../../../../services/api';

vi.mock('../../../../services/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockDashboardData = ({
  pendingMembers = [],
  activity = [],
  membersByYear = [],
  members = { total: 1200, active: 900, pending: 25 },
  positions = { total_active: 180 },
  units = { total: 64 },
  unitsByType = [
    { type: 'central', count: 1 },
    { type: 'division', count: 8 },
    { type: 'district', count: 12 },
    { type: 'upazila', count: 20 },
    { type: 'union', count: 10 },
    { type: 'ward', count: 7 },
    { type: 'campus', count: 6 },
  ],
} = {}) => {
  api.get.mockImplementation((url) => {
    if (url === '/admin/dashboard/stats') {
      return Promise.resolve({
        data: {
          data: {
            members,
            positions,
            units,
            units_by_type: unitsByType,
            members_by_year: membersByYear,
          },
        },
      });
    }

    if (url === '/admin/dashboard/activity') {
      return Promise.resolve({
        data: {
          data: activity,
        },
      });
    }

    if (url === '/admin/members/pending') {
      return Promise.resolve({
        data: {
          data: {
            data: pendingMembers,
          },
        },
      });
    }

    return Promise.reject(new Error(`Unhandled URL: ${url}`));
  });
};

const renderDashboard = () => {
  render(
    <MemoryRouter>
      <AdminDashboard />
    </MemoryRouter>
  );
};

describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDashboardData();
  });

  describe('KPI Rendering', () => {
    it('renders dashboard title and key KPI cards', async () => {
      renderDashboard();

      expect(await screen.findByText('Dashboard Overview')).toBeInTheDocument();
      expect(screen.getByText('Total Members')).toBeInTheDocument();
      expect(screen.getByText('Active Members')).toBeInTheDocument();
      expect(screen.getByText('Pending Approvals')).toBeInTheDocument();
      expect(screen.getByText('Active Positions')).toBeInTheDocument();
      expect(screen.getByText('Total Units')).toBeInTheDocument();
    });

    it('renders KPI values from API stats data', async () => {
      mockDashboardData({
        members: { total: 2450, active: 2200, pending: 50 },
        positions: { total_active: 310 },
        units: { total: 92 },
      });

      renderDashboard();

      expect(await screen.findByText('2,450')).toBeInTheDocument();
      expect(screen.getByText('2,200')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('310')).toBeInTheDocument();
      expect(screen.getByText('92')).toBeInTheDocument();
    });
  });

  describe('Pending List Behavior', () => {
    it('renders pending members in onboarding queue table', async () => {
      mockDashboardData({
        pendingMembers: [
          {
            id: 1,
            full_name: 'Rahim Uddin',
            mobile: '01711111111',
            organizational_unit: { name: 'Dhaka Campus' },
            created_at: '2026-03-20T10:00:00.000Z',
          },
          {
            id: 2,
            full_name: 'Karim Hasan',
            mobile: '01822222222',
            organizational_unit: { name: 'Central Unit' },
            created_at: '2026-03-21T09:30:00.000Z',
          },
        ],
      });

      renderDashboard();

      expect(await screen.findByText('Onboarding Queue')).toBeInTheDocument();
      expect(screen.getByText('Rahim Uddin')).toBeInTheDocument();
      expect(screen.getByText('Karim Hasan')).toBeInTheDocument();
      expect(screen.getByText('Dhaka Campus')).toBeInTheDocument();
      expect(screen.getByText('Central Unit')).toBeInTheDocument();
    });

    it('shows empty state when no pending members exist', async () => {
      mockDashboardData({ pendingMembers: [] });

      renderDashboard();

      expect(await screen.findByText('Onboarding Queue')).toBeInTheDocument();
      expect(screen.getByText('No pending applications — Cluster Sync Complete')).toBeInTheDocument();
    });
  });

  describe('Member Actions', () => {
    it('renders quick action cards for core admin operations', async () => {
      renderDashboard();

      expect(await screen.findByText('Approve Member')).toBeInTheDocument();
      expect(screen.getByText('Assign Position')).toBeInTheDocument();
      expect(screen.getByText('Control Center')).toBeInTheDocument();
    });

    it('links quick actions to expected admin routes', async () => {
      renderDashboard();

      await screen.findByText('Approve Member');

      expect(screen.getByRole('link', { name: /approve member/i })).toHaveAttribute('href', '/dashboard/admin/members/pending');
      expect(screen.getByRole('link', { name: /assign position/i })).toHaveAttribute('href', '/dashboard/admin/positions');
      expect(screen.getByRole('link', { name: /control center/i })).toHaveAttribute('href', '/dashboard/admin/settings');
      expect(screen.getByRole('link', { name: /open queue/i })).toHaveAttribute('href', '/dashboard/admin/members/pending');
    });
  });

  describe('List Filtering', () => {
    it('shows only first 8 activity records in recent pulse list', async () => {
      const activity = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        action: `approve member ${i + 1}`,
        performed_by: `admin-${i + 1}`,
        performed_at: `2026-03-${String((i % 9) + 10).padStart(2, '0')}T08:00:00.000Z`,
      }));

      mockDashboardData({ activity });
      renderDashboard();

      expect(await screen.findByText('Recent Pulse')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('approve member 1')).toBeInTheDocument();
      });

      expect(screen.getByText('approve member 8')).toBeInTheDocument();
      expect(screen.queryByText('approve member 9')).not.toBeInTheDocument();
      expect(screen.queryByText('approve member 10')).not.toBeInTheDocument();
    });

    it('shows activity empty state when there are no logs', async () => {
      mockDashboardData({ activity: [] });

      renderDashboard();

      expect(await screen.findByText('Recent Pulse')).toBeInTheDocument();
      expect(screen.getByText('No broadcast activity recorded.')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('shows unauthorized message for 401 or 403 responses', async () => {
      api.get.mockRejectedValueOnce({ response: { status: 403 } });

      renderDashboard();

      expect(await screen.findByText('Unauthorized: please sign in with an admin account.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('shows generic error message for non-auth failures', async () => {
      api.get.mockRejectedValueOnce(new Error('Network error'));

      renderDashboard();

      expect(await screen.findByText('Failed to load dashboard data.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });
});
