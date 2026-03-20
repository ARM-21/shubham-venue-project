import axios from 'lib/axios';
import { ROUTES } from 'config/routes';

export const DASHBOARD_OVERVIEW_QUERY_KEY = 'dashboard_overview';

export async function fetchDashboardOverview() {
  const res = await axios.get(ROUTES.API.ADMIN.OVERVIEW);
  return res.data;
}
