import { createTRPCRouter } from "@/backend/trpc/create-context";
import hiRoute from "@/backend/trpc/routes/example/hi/route";
import createCheckoutSessionProcedure from "@/backend/trpc/routes/stripe/create-checkout-session/route";
import cancelSubscriptionProcedure from "@/backend/trpc/routes/stripe/cancel-subscription/route";
import stripeWebhookProcedure from "@/backend/trpc/routes/stripe/webhook/route";
import { generateVerificationProcedure } from "@/backend/trpc/routes/device/generate-verification/route";
import { verifyDeviceProcedure } from "@/backend/trpc/routes/device/verify-device/route";
import { listDevicesProcedure } from "@/backend/trpc/routes/device/list-devices/route";
import { removeDeviceProcedure } from "@/backend/trpc/routes/device/remove-device/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  stripe: createTRPCRouter({
    createCheckoutSession: createCheckoutSessionProcedure,
    cancelSubscription: cancelSubscriptionProcedure,
    webhook: stripeWebhookProcedure,
  }),
  device: createTRPCRouter({
    generateVerification: generateVerificationProcedure,
    verifyDevice: verifyDeviceProcedure,
    listDevices: listDevicesProcedure,
    removeDevice: removeDeviceProcedure,
  }),
});

export type AppRouter = typeof appRouter;