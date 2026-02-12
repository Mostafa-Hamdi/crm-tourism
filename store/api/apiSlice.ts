import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { setAuth, setToken, logout } from "../slices/auth";
import type { RootState } from "../store";

/* ======================
   Types
====================== */

interface LoginResponse {
  token: string;
  fullName: string;
  email: string;
  roles: string[];
  permissions: string[];
}

interface RefreshResponse {
  accessToken: string;
}

/* ======================
   Base Query
====================== */

const baseQuery = fetchBaseQuery({
  baseUrl: "https://aura-crm.runasp.net/api",
  prepareHeaders: (headers, { getState, endpoint }) => {
    const token = (getState() as RootState).auth.token;

    // ❌ DO NOT send access token when refreshing
    if (token && endpoint !== "refresh") {
      headers.set("Authorization", `Bearer ${token}`);
    }

    headers.set("ngrok-skip-browser-warning", "true");
    return headers;
  },
  credentials: "include",
});

/* ======================
   Reauth Wrapper
====================== */

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  const isRefreshEndpoint =
    typeof args !== "string" && args.url.includes("/auth/refresh");

  if (result.error?.status === 401 && !isRefreshEndpoint) {
    const refreshResult = await baseQuery(
      { url: "/auth/refresh", method: "POST" },
      { ...api, endpoint: "refresh" }, // 👈 important
      extraOptions,
    );

    if (refreshResult.data) {
      const { accessToken } = refreshResult.data as RefreshResponse;

      if (accessToken) {
        api.dispatch(setToken(accessToken));
        result = await baseQuery(args, api, extraOptions);
      } else {
        api.dispatch(logout());
      }
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};

/* ======================
   API Slice
====================== */

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Users",
    "Roles",
    "Categories",
    "Courses",
    "Enrollments",
    "Leads",
    "Students",
    "Classes",
    "CourseClasses",
    "RolePermissions",
    "FollowUps",
  ],
  endpoints: (builder) => ({
    /* =========================
       AUTHENTICATION ENDPOINTS
       ========================= */

    login: builder.mutation<LoginResponse, { email: string; password: string }>(
      {
        query: (body) => ({
          url: "/auth/login",
          method: "POST",
          body,
        }),
        async onQueryStarted(_, { dispatch, queryFulfilled }) {
          try {
            const { data } = await queryFulfilled;
            dispatch(setAuth(data));
          } catch {
            // handled by UI
          }
        },
      },
    ),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      async onQueryStarted(_, { dispatch }) {
        dispatch(api.util.resetApiState());
        dispatch(logout());
      },
    }),

    getCurrentUser: builder.query<LoginResponse, void>({
      query: () => "/auth/me",
    }),

    /* =========================
       USER ENDPOINTS
       ========================= */

    getUsers: builder.query<any[], void>({
      query: () => "/users",
      providesTags: ["Users"],
    }),

    addUser: builder.mutation<void, any>({
      query: (body) => ({
        url: "/users",
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Users"],
    }),

    toggleUserStatus: builder.mutation<void, { id: number; status: boolean }>({
      query: ({ id, status }) => ({
        url: `/users/${id}/status`,
        method: "PUT",
        body: JSON.stringify(status),
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Users"],
    }),

    resetPass: builder.mutation<void, { id: number; newPassword: string }>({
      query: ({ id, newPassword }) => ({
        url: `/users/${id}/reset-password`,
        method: "PUT",
        body: { newPassword },
      }),
      invalidatesTags: ["Users"],
    }),

    /* =========================
       ROLE & PERMISSION ENDPOINTS
       ========================= */

    getRoles: builder.query<any[], void>({
      query: () => "/roles",
      providesTags: ["Roles"],
    }),

    addRole: builder.mutation<void, { name: string }>({
      query: ({ name }) => ({
        url: "/roles",
        method: "POST",
        body: { name },
      }),
      invalidatesTags: ["Roles"],
    }),

    deleteRole: builder.mutation<void, { id: number }>({
      query: ({ id }) => ({
        url: `/roles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Roles"],
    }),

    getPermissions: builder.query<any[], void>({
      query: () => "/permissions",
    }),

    /* =========================
       CATEGORY ENDPOINTS
       ========================= */

    getCategories: builder.query<any, void>({
      query: () => "/categories",
      providesTags: ["Categories"],
    }),

    getCategory: builder.query<any, { id: number }>({
      query: ({ id }) => ({
        url: `/categories/${id}`,
      }),
      providesTags: ["Categories"],
    }),

    addCategory: builder.mutation<void, { name: string }>({
      query: ({ name }) => ({
        url: "/categories",
        method: "POST",
        body: { name },
      }),
      invalidatesTags: ["Categories"],
    }),

    updateCategory: builder.mutation<any, { id: number; name: string }>({
      query: ({ id, name }) => ({
        url: `/categories/${id}`,
        method: "PUT",
        body: { name },
      }),
      invalidatesTags: ["Categories"],
    }),

    deleteCategory: builder.mutation<void, { id: number }>({
      query: ({ id }) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Categories"],
    }),

    /* =========================
       COURSE ENDPOINTS
       ========================= */

    getCourses: builder.query<any, void>({
      query: () => "/courses",
      providesTags: ["Courses"],
    }),

    getCourse: builder.query<any, { id: number }>({
      query: ({ id }) => ({
        url: `/courses/${id}`,
      }),
      providesTags: ["Courses"],
    }),

    addCourse: builder.mutation<
      void,
      {
        name: string;
        code: string;
        description: string;
        estimatedDurationHours: number;
        level: number;
        learningOutcomes: string;
        prerequisites: string | null;
        language: string | null;
        tags: string | null;
        thumbnailUrl: string | null;
        categoryId: number;
      }
    >({
      query: (payload) => ({
        url: "/courses",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Courses"],
    }),

    updateCourse: builder.mutation<
      any,
      {
        id: number;
        name: string;
        code: string;
        description: string;
        estimatedDurationHours: number;
        level: number;
        language: string | null;
        tags: string | null;
        learningOutcomes: string;
        prerequisites: string | null;
        thumbnailUrl: string | null;
        categoryId: number;
      }
    >({
      query: ({ id, ...payload }) => ({
        url: `/courses/${id}`,
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["Courses"],
    }),

    deleteCourse: builder.mutation<void, { id: number }>({
      query: ({ id }) => ({
        url: `/courses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Courses"],
    }),

    /* =========================
       CLASS ENDPOINTS
       ========================= */

    getClasses: builder.query<any, void>({
      query: () => "/classes",
      providesTags: ["Classes"],
    }),

    getCourseClasses: builder.query<any, { courseId: number }>({
      query: ({ courseId }) => `/courses/${courseId}/classes`,
      providesTags: ["CourseClasses"],
    }),

    getClass: builder.query<any, { id: number }>({
      query: ({ id }) => ({
        url: `/classes/${id}`,
      }),
      providesTags: ["Classes"],
    }),

    addClass: builder.mutation<
      void,
      {
        courseId: number;
        name: string;
        code: string;
        price: number;
        instructorName: string;
        startDate: string;
        endDate: string;
        daysOfWeek: string;
        timeFrom: string;
        timeTo: string;
        maxStudents: number;
      }
    >({
      query: ({
        courseId,
        name,
        code,
        price,
        instructorName,
        startDate,
        endDate,
        daysOfWeek,
        timeFrom,
        timeTo,
        maxStudents,
      }) => ({
        url: `/courses/${courseId}/classes`,
        method: "POST",
        body: {
          name,
          code,
          price,
          instructorName,
          startDate,
          endDate,
          daysOfWeek,
          timeFrom,
          timeTo,
          maxStudents,
        },
      }),
      invalidatesTags: ["Classes"],
    }),

    updateClass: builder.mutation<
      void,
      {
        id: number;
        courseId: number;
        name: string;
        code: string;
        price: number;
        instructorName: string;
        startDate: string;
        endDate: string;
        daysOfWeek: string;
        timeFrom: string;
        timeTo: string;
        maxStudents: number;
      }
    >({
      query: ({
        id,
        courseId,
        name,
        code,
        price,
        instructorName,
        startDate,
        endDate,
        daysOfWeek,
        timeFrom,
        timeTo,
        maxStudents,
      }) => ({
        url: `/classes/${id}`,
        method: "PUT",
        body: {
          name,
          code,
          price,
          instructorName,
          startDate,
          endDate,
          daysOfWeek,
          timeFrom,
          timeTo,
          maxStudents,
        },
      }),
      invalidatesTags: ["Classes"],
    }),

    deleteClass: builder.mutation<void, { id: number }>({
      query: ({ id }) => ({
        url: `/classes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Classes"],
    }),
    convertClassStatus: builder.mutation<void, { id: number; status: number }>({
      query: ({ id, status }) => ({
        url: `/classes/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["Classes", "CourseClasses"],
    }),
    /* =========================
       ENROLLMENT ENDPOINTS
       ========================= */

    getEnrollments: builder.query<any, void>({
      query: () => "/enrollments",
      providesTags: ["Enrollments"],
    }),

    getEnrollment: builder.query<any, { id: number }>({
      query: ({ id }) => ({
        url: `/enrollments/${id}`,
      }),
      providesTags: ["Enrollments"],
    }),

    addEnrollment: builder.mutation<
      void,
      { studentId: number; courseClassId: number }
    >({
      query: ({ studentId, courseClassId }) => ({
        url: `/enrollments`,
        method: "POST",
        body: { studentId, courseClassId },
      }),
      invalidatesTags: ["Enrollments"],
    }),

    updateEnrollment: builder.mutation<
      any,
      { id: number; studentId: number; courseClassId: number }
    >({
      query: ({ id, studentId, courseClassId }) => ({
        url: `/enrollments/${id}`,
        method: "PUT",
        body: { studentId, courseClassId },
      }),
      invalidatesTags: ["Enrollments"],
    }),

    convertEnrollmentStatus: builder.mutation<
      void,
      { id: number; status: number }
    >({
      query: ({ id, status }) => ({
        url: `/enrollments/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["Enrollments"],
    }),

    getFilteredEnrollments: builder.mutation<any, { statusId: number }>({
      query: ({ statusId }) => ({
        url: `/enrollments?status=${statusId}`,
        method: "GET",
      }),
    }),

    deleteEnrollment: builder.mutation<void, { id: number }>({
      query: ({ id }) => ({
        url: `/enrollments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Enrollments"],
    }),

    /* =========================
       STUDENT ENDPOINTS
       ========================= */

    getStudents: builder.query<any, void>({
      query: () => "/students",
      providesTags: ["Students"],
    }),

    getStudent: builder.query<any, { id: number }>({
      query: ({ id }) => ({
        url: `/students/${id}`,
      }),
      providesTags: ["Students"],
    }),

    addStudent: builder.mutation<
      void,
      {
        fullName: string;
        email: string;
        phoneNumber: string;
        nationalId: string;
        gender: string;
        dateOfBirth: string;
        relativeName: string;
        parentPhoneNumber: string;
        level: string;
      }
    >({
      query: (body) => ({
        url: "/students",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Students"],
    }),

    updateStudent: builder.mutation<
      any,
      {
        id: number;
        fullName: string;
        email: string;
        phoneNumber: string;
        nationalId: string;
        gender: string;
        dateOfBirth: string;
        relativeName: string;
        parentPhoneNumber: string;
        level: string;
      }
    >({
      query: ({
        id,
        fullName,
        email,
        phoneNumber,
        nationalId,
        gender,
        dateOfBirth,
        relativeName,
        parentPhoneNumber,
        level,
      }) => ({
        url: `/students/${id}`,
        method: "PUT",
        body: {
          fullName,
          email,
          phoneNumber,
          nationalId,
          gender,
          dateOfBirth,
          relativeName,
          parentPhoneNumber,
          level,
        },
      }),
      invalidatesTags: ["Students"],
    }),

    searchStudents: builder.mutation<any[], { name: string }>({
      query: ({ name }) => ({
        url: `/students/by-name?fullname=${name}`,
        method: "GET",
      }),
    }),

    deleteStudent: builder.mutation<void, { id: number }>({
      query: ({ id }) => ({
        url: `/students/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Students"],
    }),

    /* =========================
       LEAD ENDPOINTS
       ========================= */

    getLeads: builder.query<{ data: any }, void>({
      query: () => "/leads",
      providesTags: ["Leads"],
    }),
    getLeadDetails: builder.query<{ data: any }, { id: number }>({
      query: ({ id }) => ({
        url: `/leads/${id}/details`,
      }),
      providesTags: ["Leads"],
    }),
    getLeadsPipeLine: builder.query<{ leads: any }, void>({
      query: () => ({
        url: "/leads/pipeline",
      }),
      providesTags: ["Leads"],
    }),

    updateLeadStatus: builder.mutation({
      query: ({ leadId, status, reason }) => ({
        url: `/leads/${leadId}/status`,
        method: "PUT",
        body: {
          status,
          reason,
        },
      }),
    }),

    getLead: builder.query<any, { id: number }>({
      query: ({ id }) => ({
        url: `/leads/${id}`,
      }),
      providesTags: ["Leads"],
    }),

    addLead: builder.mutation<
      void,
      { fullName: string; email: string; phone: string; source: string }
    >({
      query: ({ fullName, email, phone, source }) => ({
        url: "/leads",
        method: "POST",
        body: { fullName, phone, email, source },
      }),
      invalidatesTags: ["Leads"],
    }),

    updateLead: builder.mutation<
      any,
      {
        id: number;
        fullName: string;
        phone: string;
        email: string;
        source: string;
      }
    >({
      query: ({ id, fullName, phone, email, source }) => ({
        url: `/leads/${id}`,
        method: "PUT",
        body: { fullName, phone, email, source },
      }),
      invalidatesTags: ["Leads"],
    }),

    getSpecificLeads: builder.mutation<
      { data: any },
      { pageNumber: number; pageSize: number }
    >({
      query: ({ pageNumber, pageSize }) => ({
        url: `/leads?PageNumber=${pageNumber}&PageSize=${pageSize}`,
        method: "GET",
      }),
    }),
    getSpecificStudents: builder.mutation<
      any,
      { pageNumber: number; pageSize: number }
    >({
      query: ({ pageNumber, pageSize }) => ({
        url: `/students?PageNumber=${pageNumber}&PageSize=${pageSize}`,
        method: "GET",
      }),
    }),
    getSpecificEnrollments: builder.mutation<
      any,
      { pageNumber: number; pageSize: number }
    >({
      query: ({ pageNumber, pageSize }) => ({
        url: `/enrollments?PageNumber=${pageNumber}&PageSize=${pageSize}`,
        method: "GET",
      }),
    }),
    getSpecificClasses: builder.mutation<
      any,
      { pageNumber: number; pageSize: number }
    >({
      query: ({ pageNumber, pageSize }) => ({
        url: `/classes?PageNumber=${pageNumber}&PageSize=${pageSize}`,
        method: "GET",
      }),
    }),
    getSpecificCourses: builder.mutation<
      any,
      { pageNumber: number; pageSize: number }
    >({
      query: ({ pageNumber, pageSize }) => ({
        url: `/courses?PageNumber=${pageNumber}&PageSize=${pageSize}`,
        method: "GET",
      }),
    }),
    getSpecificCategories: builder.mutation<
      any,
      { pageNumber: number; pageSize: number }
    >({
      query: ({ pageNumber, pageSize }) => ({
        url: `/categories?PageNumber=${pageNumber}&PageSize=${pageSize}`,
        method: "GET",
      }),
    }),

    getFilteredLeads: builder.mutation<any, { statusId: number }>({
      query: ({ statusId }) => ({
        url: `/leads?status=${statusId}`,
        method: "GET",
      }),
    }),

    convertStatus: builder.mutation<
      void,
      { id: number; courseClassId: number; paidAmount: number }
    >({
      query: ({ id, courseClassId, paidAmount }) => ({
        url: `/leads/${id}/convert`,
        method: "POST",
        body: { courseClassId, paidAmount },
      }),
      invalidatesTags: ["Leads"],
    }),
    convertLeadStatus: builder.mutation<void, { id: number; status: number }>({
      query: ({ id, status }) => ({
        url: `/leads/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["Leads"],
    }),
    assignLead: builder.mutation<void, { id: number; userId: number }>({
      query: ({ id, userId }) => ({
        url: `/leads/${id}/assign`,
        method: "PUT",
        body: { userId },
      }),
      invalidatesTags: ["Leads"],
    }),

    deleteLead: builder.mutation<void, { id: number }>({
      query: ({ id }) => ({
        url: `/leads/${id}/archive`,
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Leads"],
    }),

    /* =========================
       LEAD NOTES ENDPOINTS
       ========================= */

    getLeadNotes: builder.query<any, { id: number }>({
      query: ({ id }) => ({
        url: `/leads/${id}/notes`,
      }),
    }),

    addLeadNote: builder.mutation<
      void,
      { id: number; note: string; interactionType: number }
    >({
      query: ({ id, note, interactionType }) => ({
        url: `/leads/${id}/notes`,
        method: "POST",
        body: { note, interactionType },
      }),
      invalidatesTags: ["Leads"],
    }),
    addLeadTask: builder.mutation<
      void,
      { id: number; title: string; dueDate: string }
    >({
      query: ({ id, title, dueDate }) => ({
        url: `/leads/${id}/tasks`,
        method: "POST",
        body: { title, dueDate },
      }),
      invalidatesTags: ["Leads"],
    }),

    /* =========================
       LEAD FOLLOW-UP ENDPOINTS
       ========================= */

    // Get single lead follow-up by lead ID (QUERY)
    getLeadFollowup: builder.query<any, { id: number }>({
      query: ({ id }) => ({
        url: `/leads/${id}/follow-up`,
      }),
      providesTags: ["FollowUps"],
    }),

    // GET /api/leads/follow-ups - Get all follow-ups (QUERY - auto-fetch)
    getFollowups: builder.query<any[], void>({
      query: () => "/leads/follow-ups",
      providesTags: ["FollowUps"],
    }),

    // GET /api/leads/follow-ups?today=true (MUTATION - manual trigger)
    getFollowupsToday: builder.mutation<any[], void>({
      query: () => ({
        url: "/leads/follow-ups",
        params: { today: true },
      }),
    }),

    // GET /api/leads/follow-ups?overdue=true (MUTATION - manual trigger)
    getFollowupsOverdue: builder.mutation<any[], void>({
      query: () => ({
        url: "/leads/follow-ups",
        params: { overdue: true },
      }),
    }),

    // GET /api/leads/follow-ups?from=X&to=Y (MUTATION - manual trigger)
    getFollowupsByDateRange: builder.mutation<
      any[],
      { from: string; to: string }
    >({
      query: ({ from, to }) => ({
        url: "/leads/follow-ups",
        params: { from, to },
      }),
    }),

    /* =========================
       LEAD IMPORT/EXPORT ENDPOINTS
       ========================= */

    importLeads: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: "/leads/import",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Leads"],
    }),

    exportLeads: builder.mutation<Blob, void>({
      query: () => ({
        url: "/leads/export",
        method: "GET",
        responseHandler: async (response) => {
          return response.blob();
        },
        cache: "no-cache",
      }),
    }),
    getRolePermissions: builder.query<any, { id: number }>({
      query: ({ id }) => ({
        url: `/roles/${id}/permissions`,
      }),
      providesTags: ["RolePermissions"],
    }),
    updateRole: builder.mutation<
      any,
      {
        id: number;
        roleName: string;
        permissionCodes: string[];
      }
    >({
      query: ({ id, roleName, permissionCodes }) => ({
        url: `/roles/${id}`,
        method: "PUT",
        body: {
          roleName,
          permissionCodes,
        },
      }),
      invalidatesTags: ["RolePermissions", "Roles"],
    }),
  }),
});

/* ======================
   Hooks Export
====================== */

export const {
  // Auth
  useLoginMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,

  // Users
  useGetUsersQuery,
  useAddUserMutation,
  useToggleUserStatusMutation,
  useResetPassMutation,

  // Roles & Permissions
  useGetRolesQuery,
  useAddRoleMutation,
  useDeleteRoleMutation,
  useGetPermissionsQuery,
  useGetRolePermissionsQuery,
  useUpdateRoleMutation,
  // Categories
  useGetCategoriesQuery,
  useGetCategoryQuery,
  useAddCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetSpecificCategoriesMutation,
  // Courses
  useGetCoursesQuery,
  useGetCourseQuery,
  useAddCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useGetSpecificCoursesMutation,

  // Classes
  useGetClassesQuery,
  useGetCourseClassesQuery,
  useGetClassQuery,
  useAddClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,
  useConvertClassStatusMutation,
  useGetSpecificClassesMutation,
  // Enrollments
  useGetEnrollmentsQuery,
  useGetEnrollmentQuery,
  useAddEnrollmentMutation,
  useUpdateEnrollmentMutation,
  useConvertEnrollmentStatusMutation,
  useGetFilteredEnrollmentsMutation,
  useDeleteEnrollmentMutation,
  useGetSpecificEnrollmentsMutation,

  // Students
  useGetStudentsQuery,
  useGetStudentQuery,
  useAddStudentMutation,
  useUpdateStudentMutation,
  useSearchStudentsMutation,
  useDeleteStudentMutation,
  useGetSpecificStudentsMutation,
  // Leads
  useGetLeadsQuery,
  useGetLeadDetailsQuery,
  useGetLeadsPipeLineQuery,
  useGetLeadQuery,
  useAddLeadMutation,
  useUpdateLeadMutation,
  useGetSpecificLeadsMutation,
  useGetFilteredLeadsMutation,
  useConvertStatusMutation,
  useConvertLeadStatusMutation,
  useDeleteLeadMutation,
  useUpdateLeadStatusMutation,
  useAssignLeadMutation,
  useAddLeadTaskMutation,
  // Lead Notes
  useGetLeadNotesQuery,
  useAddLeadNoteMutation,

  // Lead Follow-ups
  useGetLeadFollowupQuery,
  useGetFollowupsQuery,
  useGetFollowupsTodayMutation,
  useGetFollowupsOverdueMutation,
  useGetFollowupsByDateRangeMutation,

  // Lead Import/Export
  useImportLeadsMutation,
  useExportLeadsMutation,
} = api;
