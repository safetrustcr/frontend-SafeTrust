import * as Sentry from "@sentry/nextjs";
import { sentryOptions } from "./src/lib/monitoring/sentry-options";

Sentry.init(sentryOptions);