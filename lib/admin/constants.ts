export const ADMIN_EMAIL = "entermarketing@gmail.com";
export const ADMIN_NAME = "Enter Marketing Admin";

export const ADMIN_ROUTES = {
  root: "/admin",
  login: "/admin/login",
  cases: "/admin",
  caseNew: "/admin/cases/new",
  caseEdit: (id: string) => `/admin/cases/${id}`,
} as const;

export const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 80 * 1024 * 1024;
