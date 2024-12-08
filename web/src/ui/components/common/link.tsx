"use client";

import NextLink, { LinkProps as NextLinkProps } from "next/link";

type LinkAnalytics = {
  event: string;
  data?: Record<string, string>;
};

type LinkProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  keyof NextLinkProps
> &
  NextLinkProps & {
    isAnchor?: boolean;
    children?: React.ReactNode;
    className?: string;
    analytics?: LinkAnalytics;
  };

export const Link = ({
  isAnchor,
  href,
  children,
  analytics,
  onClick,
  ...props
}: LinkProps) => {
  const customOnClick =
    onClick && analytics
      ? (e: any) => {
          sendAnalytics(analytics);
          onClick(e);
        }
      : analytics
        ? () => {
            sendAnalytics(analytics);
          }
        : undefined;

  if (isAnchor) {
    return (
      <a
        href={href as string}
        // ! make sure we handle cases where user passes in custom onClick
        onClick={customOnClick}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <NextLink href={href} onClick={customOnClick} {...props}>
      {children}
    </NextLink>
  );
};

const sendAnalytics = (analytics: LinkAnalytics) => {
  // process.env.NODE_ENV === "development" &&
  //   console.log("Analytics send attempt", {
  //     analyticsEventName: analytics.event,
  //     analyticsEventData: analytics.data,
  //     umami: window?.umami,
  //   });
  // try {
  //   window?.umami?.track(analytics.event, analytics.data);
  // } catch (error) {
  //   // don't want to show users mass errors
  //   process.env.NODE_ENV === "development" && console.error(error);
  // }
};
