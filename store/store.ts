import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { api } from "./api/apiSlice";
import authReducer from "./slices/auth";
import followupsReducer from "./slices/followups";

import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

const rootReducer = combineReducers({
  auth: authReducer,
  followups: followupsReducer,
  [api.reducerPath]: api.reducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["subscription", "auth"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore Redux Persist actions
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
          // Also ignore RTK Query file operations
          "api/executeMutation/pending",
          "api/executeMutation/fulfilled",
          "api/executeMutation/rejected",
        ],
        // Ignore file-related paths in actions and state
        ignoredActionPaths: [
          "meta.arg", // FormData for imports
          "meta.baseQueryMeta", // Response metadata
          "payload", // Blob for exports
        ],
        ignoredPaths: [
          "api.mutations", // All mutation state (includes FormData/Blob)
          "api.queries", // All query state
        ],
      },
    }).concat(api.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
