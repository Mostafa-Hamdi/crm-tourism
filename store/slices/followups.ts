import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { api } from "@/store/api/apiSlice";

interface FollowupsState {
  todayCount: number;
}

const initialState: FollowupsState = {
  todayCount: 0,
};

const followupsSlice = createSlice({
  name: "followups",
  initialState,
  reducers: {
    setTodayCount(state, action: PayloadAction<number>) {
      state.todayCount = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Update count when `getFollowupsToday` (mutation) fulfills
    builder.addMatcher(
      api.endpoints.getFollowupsToday.matchFulfilled,
      (state, { payload }) => {
        const data = Array.isArray(payload)
          ? payload
          : (payload && (payload as any).data) || [];
        state.todayCount = Array.isArray(data) ? data.length : 0;
      },
    );

    // Update count when `getFollowups` (all followups) fulfills by deriving which ones are for today
    builder.addMatcher(
      api.endpoints.getFollowups.matchFulfilled,
      (state, { payload }) => {
        const data = payload || [];
        if (!Array.isArray(data)) return;

        const today = new Date();
        const y = today.getFullYear();
        const m = today.getMonth();
        const d = today.getDate();

        const count = data.filter((f: any) => {
          if (!f || !f.followUpDate) return false;
          const dt = new Date(f.followUpDate);
          return (
            dt.getFullYear() === y && dt.getMonth() === m && dt.getDate() === d
          );
        }).length;

        state.todayCount = count;
      },
    );
  },
});

export const { setTodayCount } = followupsSlice.actions;
export default followupsSlice.reducer;

// Simple selector (avoid importing RootState here to prevent circular deps)
export const selectTodayCount = (state: any) =>
  state.followups?.todayCount ?? 0;
