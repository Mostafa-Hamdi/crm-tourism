"use client";
import Layout from "./layout-components/Layout";
import { useSelector } from "react-redux";
import Login from "./components/Login";
import { PropsWithChildren, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LocaleProvider, useIsRTL } from "./i18n/LocaleProvider";

export default function LayoutClient({ children }: PropsWithChildren) {
  const isLogin = useSelector((state: any) => state.auth.isAuthenticated);
  const router = useRouter();
  useEffect(() => {
    if (!isLogin) router.push("/");
  }, [isLogin]);
  // don't call locale hooks before provider mounts
  const Inner = ({ children }: PropsWithChildren) => {
    const isRTL = useIsRTL();

    return (
      <>
        <Layout />
        <main
          className={`
            transition-all duration-300
            ${isRTL ? "lg:pr-64" : "lg:pl-64"}
          `}
        >
          {children}
        </main>
      </>
    );
  };

  return (
    <LocaleProvider>
      <>{isLogin ? <Inner>{children}</Inner> : <Login />}</>
    </LocaleProvider>
  );
}
