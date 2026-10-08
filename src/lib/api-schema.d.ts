export interface paths {
    "/me/push-tokens": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Register the Expo push token of this device for the user; a token registered by another account moves to this one */
        post: operations["registerPushToken"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/push-tokens/{token}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Stop sending pushes to this device (call on logout); the token goes URL encoded and unknown tokens are ignored */
        delete: operations["removePushToken"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/notifications": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List the notifications of the user, newest first, with the unread count */
        get: operations["listMyNotifications"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/notifications/read-all": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Mark every unread notification of the user as read */
        post: operations["markAllNotificationsRead"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/notifications/{notificationId}/read": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Mark a notification as read; repeated calls keep the first readAt */
        post: operations["markNotificationRead"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/register": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Register a driver */
        post: operations["register"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Log in with email and password */
        post: operations["login"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Rotate the refresh token and issue a new access token */
        post: operations["refresh"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Revoke a refresh token */
        post: operations["logout"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get the authenticated user */
        get: operations["getMe"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/email-verification/confirm": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Confirm the email address with the token sent by email */
        post: operations["confirmEmailVerification"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/email-verification/resend": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Send a new verification email to the authenticated user */
        post: operations["resendEmailVerification"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/password/forgot": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Send a password reset link if the email is registered */
        post: operations["forgotPassword"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/password/reset": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Set a new password with the token sent by email */
        post: operations["resetPassword"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/email-login/request": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Send a login code and magic link if the email is registered */
        post: operations["requestEmailLogin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/email-login/verify": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Log in with the emailed code or magic link token
         * @description Send either { email, code } or { token }. Five wrong codes lock the current code and link.
         */
        post: operations["verifyEmailLogin"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/oauth/google": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Log in or sign up with a Google ID token
         * @description Links the Google account to an existing user with the same email or creates a driver account.
         */
        post: operations["loginWithGoogle"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/oauth/google/code": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Log in or sign up with a Google OAuth authorization code
         * @description Exchanges an authorization code obtained through the Google popup flow (redirect URI "postmessage") for an ID token, then behaves like loginWithGoogle.
         */
        post: operations["loginWithGoogleCode"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/oauth/apple": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Log in or sign up with a Sign in with Apple identity token
         * @description Links the Apple ID to an existing user with the same email or creates a driver account. Private relay emails are accepted.
         */
        post: operations["loginWithApple"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Delete the account of the authenticated user now
         * @description Sends a confirmation email to the current address, then, in one transaction, anonymizes the user (name "Usuário excluído", email deleted+<id>@evchargeops.invalid, no password), deletes the Google/Apple identities, refresh tokens, push tokens and one-time tokens, and completes the deletion request (creating one when there is none). Sessions and memberships stay for the condo cost sharing under the anonymized name. The TEST and LIVE Stripe customers are deleted afterwards on a best-effort basis. The access token stops being refreshable; the app must sign out.
         */
        delete: operations["deleteMyAccount"];
        options?: never;
        head?: never;
        /**
         * Update the identification data of the authenticated user
         * @description Only the name can be changed; changing the email needs a verification flow and is not supported.
         */
        patch: operations["updateMyProfile"];
        trace?: never;
    };
    "/me/password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Change or create the password of the authenticated user
         * @description currentPassword is required when the user already has a password (hasPassword). Every refresh token of the user is revoked, including the current one, and a new session is returned that the caller must store in place of the old tokens. A security email is sent.
         */
        post: operations["changeMyPassword"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/organizations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List the organizations of the authenticated user */
        get: operations["listMyOrganizations"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/organizations/{organizationId}/members": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List the members of an organization (managers only) */
        get: operations["listOrganizationMembers"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/organizations/{organizationId}/invites": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List pending, expired and accepted invites */
        get: operations["listInvites"];
        put?: never;
        /** Invite someone by email to join the organization as a driver */
        post: operations["createInvite"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/organizations/{organizationId}/invites/{inviteId}/resend": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Issue a new link, extend the expiry and send the invite again */
        post: operations["resendInvite"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/organizations/{organizationId}/invites/{inviteId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Revoke an invite */
        delete: operations["revokeInvite"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/invites/{token}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Show the organization and email of an invite */
        get: operations["getInvitePreview"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/invites/{token}/accept": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Create an account with the invited email and join the organization */
        post: operations["acceptInvite"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/invites/{token}/accept-authenticated": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Join the organization with the authenticated account */
        post: operations["acceptInviteAsCurrentUser"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/charge-points": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List the charge points visible to the user. With bbox: light map items (ChargePointMapItemResponseDto) inside the viewport, nearest to its center first, up to limit, priced without calling the model. With organizationId: every visible point of that organization (ChargePointResponseDto). Without filters (app 1.4.0): the private points of the organizations of the user plus the commercial points within 25 km of the centroid of their condo (or of São Paulo), at most 200 (ChargePointResponseDto) */
        get: operations["listChargePoints"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/charge-points/clusters": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Group the charge points visible to the user inside the viewport in a grid whose cell size follows the zoom, for zoomed out maps (zoom 9 or less) */
        get: operations["listChargePointClusters"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/charge-points/{chargePointId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get a charge point visible to the user */
        get: operations["getChargePoint"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/charge-points/{chargePointId}/queue": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Join the queue of a busy charge point; when it frees up, the head of the queue gets a 10 minute reservation and a QUEUE_TURN notification */
        post: operations["joinChargePointQueue"];
        /** Leave the queue of the charge point, giving up a reservation if you hold one */
        delete: operations["leaveChargePointQueue"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/charge-points/{chargePointId}/queue/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Your latest entry in the queue of the charge point with the position, status and reservation */
        get: operations["getMyQueueEntry"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/organizations/{organizationId}/tariff": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get the tariff currently in force for the organization */
        get: operations["getOrganizationTariff"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Change the tariff of the organization (managers only). Creates a new version valid from now; running sessions keep their locked price */
        patch: operations["updateOrganizationTariff"];
        trace?: never;
    };
    "/sessions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List the sessions of the user, newest first, optionally limited to the sessions started in a month */
        get: operations["listMySessions"];
        put?: never;
        /** Start a session at a point, locking the price per kWh and the demand factor. Private points start charging right away; commercial points hold the estimated maximum on the card first (AWAITING_PAYMENT with the PaymentSheet parameters) and start charging once the hold is authorized */
        post: operations["startSession"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/sessions/active": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get the open session of the user (charging, grace or idle), advanced up to now */
        get: operations["getActiveSession"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/sessions/{sessionId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get a session of the user, advancing its telemetry, state and fees up to now */
        get: operations["getSession"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/organizations/{organizationId}/sessions/{sessionId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get a session of the organization (managers only) with its driver, advancing its telemetry, state and fees up to now */
        get: operations["getOrganizationSession"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/organizations/{organizationId}/sessions/{sessionId}/anomaly-review": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Confirm or dismiss the anomaly flag of a session of the organization (managers only), with an optional note. Reviewing again replaces the previous decision; billing does not change */
        post: operations["reviewSessionAnomaly"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/sessions/{sessionId}/stop": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** End the session: stops charging early with the partial energy, or unplugs during grace/idle freezing the idle fee. Card payments are captured with the final amount, or released when nothing is due or the session is canceled before charging */
        post: operations["stopSession"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/sessions/{sessionId}/payment/confirm": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Check the card hold with Stripe after the PaymentSheet completes: an authorized hold starts charging, a canceled one interrupts the session. Idempotent and safe to call again (the Stripe webhook does the same) */
        post: operations["confirmSessionPayment"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/sessions/{sessionId}/payment/sheet": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Issue fresh PaymentSheet parameters (new ephemeral key) for a session still AWAITING_PAYMENT, e.g. after the app was reopened */
        post: operations["createSessionPaymentSheet"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/payments/stripe/webhook": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Stripe TEST mode webhook (payment_intent.amount_capturable_updated, canceled, payment_failed, succeeded). Verifies the signature over the raw body with STRIPE_WEBHOOK_SECRET and reconciles the TEST mode session with the PaymentIntent; duplicates are ignored */
        post: operations["handleStripeWebhook"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/payments/stripe/webhook/live": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Stripe LIVE mode webhook with the same events as handleStripeWebhook. Verifies the signature over the raw body with STRIPE_LIVE_WEBHOOK_SECRET and reconciles the LIVE mode session with the PaymentIntent; duplicates are ignored */
        post: operations["handleStripeLiveWebhook"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/organizations/{organizationId}/statements/export.csv": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Export the monthly statement for the bill importer: unidade;kwh;energia;acesso;ocupacao;total, decimal comma, UTF-8 with BOM */
        get: operations["exportMonthlyStatementCsv"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/organizations/{organizationId}/statements": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Monthly cost-sharing statement per unit: energy at cost, access fee and idle fees (private regime only) */
        get: operations["getMonthlyStatement"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/statements/{month}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Monthly cost-sharing statement of the unit of the authenticated user in a condominium (private regime only), with the energy per day */
        get: operations["getMyMonthlyStatement"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/organizations/{organizationId}/sessions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List the sessions of the organization (managers only), filtered by month, unit, status, charge point, anomaly flag and anomaly review status */
        get: operations["listOrganizationSessions"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/organizations/{organizationId}/overview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Monthly indicators of the organization (managers only): energy, sessions, cost-sharing total, electrical capacity, recent anomalies and current price per point */
        get: operations["getOrganizationOverview"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/consents": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Current LGPD consent per purpose, the current terms version and whether the user must accept the terms again */
        get: operations["getMyConsents"];
        /** Accept the current terms and record the consent choices; every change is appended to the history */
        put: operations["updateMyConsents"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/data-export": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** LGPD data portability: JSON with the profile, memberships, sessions, consent history and deletion requests of the user */
        get: operations["exportMyData"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/deletion-request": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Record a request to delete the account and its data; repeated calls return the pending request */
        post: operations["requestAccountDeletion"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /** @enum {string} */
        PushPlatform: "IOS" | "ANDROID";
        RegisterPushTokenRequestDto: {
            /** @example ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx] */
            token: string;
            platform: components["schemas"]["PushPlatform"];
        };
        PushTokenResponseDto: {
            /** @example ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx] */
            token: string;
            platform: components["schemas"]["PushPlatform"];
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            updatedAt: string;
        };
        /** @enum {string} */
        NotificationType: "SESSION_ACTIVE" | "CHARGING_COMPLETE" | "IDLE_FEE_STARTED" | "PAYMENT_CAPTURED" | "PAYMENT_FAILED" | "SESSION_INTERRUPTED" | "ORGANIZATION_INVITE" | "QUEUE_TURN";
        NotificationResponseDto: {
            /** Format: uuid */
            id: string;
            type: components["schemas"]["NotificationType"];
            /** @example Recarga concluída */
            title: string;
            /** @example Seu veículo no ponto Vaga L1-01 terminou de carregar. Você tem 10 minutos de tolerância para liberar a vaga. */
            body: string;
            /**
             * @description Payload for navigation; session notifications carry sessionId, chargePointId and chargePointName
             * @example {
             *       "sessionId": "6f1c0f7e-2c1a-4a43-9b8e-2a4d1c0e9f10",
             *       "chargePointId": "0c5d8a2e-77b1-4c39-8f0e-9d6f1b2a3c4d",
             *       "chargePointName": "Vaga L1-01",
             *       "graceEndsAt": "2026-10-07T22:40:00.000Z",
             *       "gracePeriodMinutes": 10
             *     }
             */
            data: {
                [key: string]: unknown;
            };
            /** Format: date-time */
            readAt: string | null;
            /** Format: date-time */
            createdAt: string;
        };
        NotificationPageResponseDto: {
            items: components["schemas"]["NotificationResponseDto"][];
            /** @example 42 */
            total: number;
            /** @example 1 */
            page: number;
            /** @example 20 */
            pageSize: number;
            /**
             * @description Unread notifications of the user
             * @example 3
             */
            unreadCount: number;
        };
        ReadAllNotificationsResponseDto: {
            /**
             * @description Notifications marked as read now
             * @example 3
             */
            markedCount: number;
            /** @example 0 */
            unreadCount: number;
        };
        RegisterDto: {
            /** @example Ana Souza */
            name: string;
            /**
             * Format: email
             * @example ana@example.com
             */
            email: string;
            /** @example s3cure-passw0rd */
            password: string;
        };
        /** @enum {string} */
        Role: "DRIVER" | "MANAGER";
        /**
         * @description Stripe mode used for the card payments of this user: TEST (test cards) or LIVE (real cards)
         * @enum {string}
         */
        PaymentMode: "TEST" | "LIVE";
        /**
         * @description Where the app takes the user position from: DEMO (fixed demo location) or DEVICE (device GPS)
         * @enum {string}
         */
        LocationMode: "DEMO" | "DEVICE";
        UserResponseDto: {
            /** Format: uuid */
            id: string;
            /** @example Ana Souza */
            name: string;
            /**
             * Format: email
             * @example ana@example.com
             */
            email: string;
            role: components["schemas"]["Role"];
            /** @description Whether the user confirmed their email */
            emailVerified: boolean;
            /** @description Whether the user has a password; accounts created with Google, Apple or an email code may not */
            hasPassword: boolean;
            /** @description Stripe mode used for the card payments of this user: TEST (test cards) or LIVE (real cards) */
            paymentMode: components["schemas"]["PaymentMode"];
            /** @description Where the app takes the user position from: DEMO (fixed demo location) or DEVICE (device GPS) */
            locationMode: components["schemas"]["LocationMode"];
            /** @description Whether captured card payments of this user are refunded in full right after the capture */
            autoRefund: boolean;
        };
        AuthResponseDto: {
            user: components["schemas"]["UserResponseDto"];
            /** @description JWT access token (Bearer) */
            accessToken: string;
            /** @description Opaque refresh token, rotated on each use */
            refreshToken: string;
        };
        LoginDto: {
            /**
             * Format: email
             * @example ana@example.com
             */
            email: string;
            /** @example s3cure-passw0rd */
            password: string;
        };
        RefreshTokenDto: {
            /** @description Opaque refresh token issued at login */
            refreshToken: string;
        };
        ConfirmEmailVerificationDto: {
            /** @description Token received in the verification link */
            token: string;
        };
        ForgotPasswordDto: {
            /**
             * Format: email
             * @example ana@example.com
             */
            email: string;
        };
        ResetPasswordDto: {
            /** @description Token received in the password reset link */
            token: string;
            /** @example n3w-s3cure-passw0rd */
            password: string;
        };
        RequestEmailLoginDto: {
            /**
             * Format: email
             * @example ana@example.com
             */
            email: string;
        };
        VerifyEmailLoginDto: {
            /**
             * Format: email
             * @description Required with code; must be omitted when token is sent
             * @example ana@example.com
             */
            email?: string;
            /**
             * @description Six digit code sent by email; required with email
             * @example 042817
             */
            code?: string;
            /** @description Token from the magic link; must be sent alone, without email and code */
            token?: string;
        };
        GoogleLoginDto: {
            /** @description ID token returned by Google Sign-In */
            idToken: string;
        };
        GoogleCodeLoginDto: {
            /** @description Authorization code returned by the Google OAuth popup (redirect URI "postmessage") */
            code: string;
        };
        AppleFullNameDto: {
            /** @example Ana */
            givenName?: string;
            /** @example Souza */
            familyName?: string;
        };
        AppleLoginDto: {
            /** @description Identity token returned by Sign in with Apple */
            identityToken: string;
            /** @description Name shared by Apple on the first authorization only */
            fullName?: components["schemas"]["AppleFullNameDto"];
        };
        UpdateMyProfileDto: {
            /** @example Ana Souza */
            name: string;
        };
        ChangeMyPasswordDto: {
            /** @description Required when the account already has a password (hasPassword); omit it to create the first password of a Google, Apple or email code account */
            currentPassword?: string;
            /** @example n3w-s3cure-passw0rd */
            newPassword: string;
        };
        /** @enum {string} */
        OrganizationType: "PRIVATE" | "COMMERCIAL";
        /**
         * @description Role of the authenticated user in the organization
         * @enum {string}
         */
        MembershipRole: "MANAGER" | "DRIVER";
        MyOrganizationDto: {
            /** Format: uuid */
            id: string;
            /** @example Residencial Aclimação */
            name: string;
            type: components["schemas"]["OrganizationType"];
            /** @description Role of the authenticated user in the organization */
            role: components["schemas"]["MembershipRole"];
            /** @example B · 42 */
            unitLabel: string | null;
        };
        OrganizationMemberDto: {
            /** Format: uuid */
            userId: string;
            /** @example Ana Souza */
            name: string;
            /**
             * Format: email
             * @example ana@example.com
             */
            email: string;
            role: components["schemas"]["MembershipRole"];
            /** @example B · 42 */
            unitLabel: string | null;
            /** Format: date-time */
            joinedAt: string;
        };
        CreateInviteDto: {
            /**
             * Format: email
             * @example ana@example.com
             */
            email: string;
            /** @example B · 42 */
            unitLabel?: string;
        };
        /** @enum {string} */
        InviteStatus: "PENDING" | "EXPIRED" | "ACCEPTED" | "REVOKED";
        InviteResponseDto: {
            /** Format: uuid */
            id: string;
            /**
             * Format: email
             * @example ana@example.com
             */
            email: string;
            /** @example B · 42 */
            unitLabel: string | null;
            role: components["schemas"]["MembershipRole"];
            status: components["schemas"]["InviteStatus"];
            /** Format: date-time */
            expiresAt: string;
            /** Format: date-time */
            acceptedAt: string | null;
            /** Format: date-time */
            createdAt: string;
        };
        InvitePreviewDto: {
            /** @example Residencial Aclimação */
            organizationName: string;
            /**
             * Format: email
             * @example ana@example.com
             */
            email: string;
            /** @example B · 42 */
            unitLabel: string | null;
            /** Format: date-time */
            expiresAt: string;
            status: components["schemas"]["InviteStatus"];
        };
        AcceptInviteDto: {
            /** @example Ana Souza */
            name: string;
            /** @example s3cure-passw0rd */
            password: string;
        };
        /** @enum {string} */
        ChargePointType: "PRIVATE" | "COMMERCIAL";
        /** @enum {string} */
        ChargePointStatus: "AVAILABLE" | "CHARGING" | "IDLE" | "OFFLINE";
        /** @enum {string} */
        ConnectorType: "TYPE_2" | "CCS_2" | "CHADEMO" | "OTHER";
        ChargerResponseDto: {
            /** Format: uuid */
            id: string;
            /** @example GoodWe HCA G2 */
            vendor: string;
            /** @example GW-HCA-G2-0001 */
            serialNumber: string;
            connector: components["schemas"]["ConnectorType"];
        };
        /** @enum {string} */
        DemandLevel: "OFF_PEAK" | "NORMAL" | "PEAK";
        /** @enum {string} */
        DemandFactorSource: "RULE" | "MODEL";
        ChargePointPricingDto: {
            /**
             * @description Price per kWh in cents if a session started now. Private points pass the utility rate through; commercial points apply the demand factor to the base rate
             * @example 89
             */
            pricePerKwhCents: number;
            /** @example 89 */
            utilityRateCents: number;
            /** @example 189 */
            baseRateCents: number | null;
            /**
             * @description Current demand multiplier
             * @example 1
             */
            demandFactor: number;
            demandLevel: components["schemas"]["DemandLevel"];
            demandFactorSource: components["schemas"]["DemandFactorSource"];
            /** @example null */
            demandModelVersion: string | null;
            /** @description False on private points, where the factor is informational only (no margin on energy) */
            demandFactorApplied: boolean;
            /** @example 25 */
            idleFeeCentsPerMinute: number;
            /** @example 3000 */
            idleFeeCapCents: number;
            /** @example 10 */
            gracePeriodMinutes: number;
        };
        /**
         * @description WAITING in line, NOTIFIED when it is your turn and the point is reserved until reservedUntil, EXPIRED when the reservation ran out, LEFT when you left, FULFILLED when you started a session
         * @enum {string}
         */
        QueueEntryStatus: "WAITING" | "NOTIFIED" | "EXPIRED" | "LEFT" | "FULFILLED";
        QueueEntryResponseDto: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            chargePointId: string;
            /** @description WAITING in line, NOTIFIED when it is your turn and the point is reserved until reservedUntil, EXPIRED when the reservation ran out, LEFT when you left, FULFILLED when you started a session */
            status: components["schemas"]["QueueEntryStatus"];
            /**
             * @description Position in line starting at 1, null once the entry ended
             * @example 2
             */
            position: number | null;
            /**
             * @description People in line at this point
             * @example 3
             */
            queueLength: number;
            /**
             * Format: date-time
             * @description End of your reservation while NOTIFIED
             */
            reservedUntil: string | null;
            /** Format: date-time */
            notifiedAt: string | null;
            /** Format: date-time */
            endedAt: string | null;
            /** Format: date-time */
            createdAt: string;
        };
        ChargePointResponseDto: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            organizationId: string;
            /** @example Residencial Aclimação */
            organizationName: string;
            /** @example L1-01 */
            code: string;
            /** @example Garagem L1 · Vaga 12 */
            name: string;
            type: components["schemas"]["ChargePointType"];
            /** @example -23.56905 */
            latitude: number;
            /** @example -46.63145 */
            longitude: number;
            /** @example 7 */
            maxPowerKw: number;
            /**
             * Format: uri
             * @description Absolute URL of a photo of the point, null without one
             * @example https://app.evchargeops.com.br/media/points/garage-a.webp
             */
            photoUrl: string | null;
            /**
             * @description Data attribution to show with the point, set for points imported from Open Charge Map and null otherwise
             * @example Dados de localização © Open Charge Map (CC BY-SA 4.0)
             */
            attribution: string | null;
            status: components["schemas"]["ChargePointStatus"];
            /** @description Whether the user belongs to the organization of the point */
            isMember: boolean;
            charger: components["schemas"]["ChargerResponseDto"] | null;
            /** @description Null when no tariff is configured */
            pricing: components["schemas"]["ChargePointPricingDto"] | null;
            /**
             * @description People waiting or holding a reservation at this point
             * @example 2
             */
            queueLength: number;
            /**
             * Format: date-time
             * @description Set while the point is free but reserved for the head of the queue; only that user can start a session until then
             */
            reservedUntil: string | null;
            /** @description Your active entry in the queue of this point */
            myQueueEntry: components["schemas"]["QueueEntryResponseDto"] | null;
        };
        /**
         * @description SEED for the demo network, OCM for points imported from Open Charge Map
         * @enum {string}
         */
        ChargePointSource: "SEED" | "OCM";
        ChargePointMapItemResponseDto: {
            /** Format: uuid */
            id: string;
            /** @example L1-01 */
            code: string;
            /** @example Garagem L1 · Vaga 12 */
            name: string;
            type: components["schemas"]["ChargePointType"];
            status: components["schemas"]["ChargePointStatus"];
            /** @example -23.56905 */
            latitude: number;
            /** @example -46.63145 */
            longitude: number;
            /** @example 22 */
            maxPowerKw: number;
            /** @description Connector of the first charger, null without a charger */
            connector: components["schemas"]["ConnectorType"] | null;
            /**
             * @description Name of the organization that operates the point
             * @example Residencial Aclimação
             */
            operatorName: string;
            /**
             * @description Base price per kWh in cents without the demand factor: the base rate of commercial points, the utility rate of private ones. Null without a tariff
             * @example 189
             */
            basePricePerKwhCents: number | null;
            /**
             * @description Price per kWh in cents with the demand factor already cached for the operator in this hour, or the base price when none is cached. The detail (getChargePoint) has the exact price
             * @example 227
             */
            pricePerKwhCents: number | null;
            /**
             * Format: uri
             * @example https://app.evchargeops.com.br/media/points/garage-a.webp
             */
            photoUrl: string | null;
            /** @description SEED for the demo network, OCM for points imported from Open Charge Map */
            source: components["schemas"]["ChargePointSource"];
        };
        ChargePointClusterResponseDto: {
            /**
             * @description Average latitude of the points in the cell
             * @example -23.5612
             */
            latitude: number;
            /**
             * @description Average longitude of the points in the cell
             * @example -46.6421
             */
            longitude: number;
            /**
             * @description Points in the cell
             * @example 42
             */
            count: number;
            /**
             * @description Online points in the cell without an open session
             * @example 30
             */
            availableCount: number;
        };
        TariffResponseDto: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            organizationId: string;
            /**
             * @description Utility energy rate per kWh in cents, passed through
             * @example 89
             */
            utilityRateCents: number;
            /**
             * @description Base rate per kWh in cents on commercial points
             * @example 189
             */
            baseRateCents: number | null;
            /**
             * @description Monthly access fee per unit with a vehicle, in cents
             * @example 3500
             */
            accessFeeCents: number;
            /** @example 25 */
            idleFeeCentsPerMinute: number;
            /** @example 3000 */
            idleFeeCapCents: number;
            /** @example 10 */
            gracePeriodMinutes: number;
            /** Format: date-time */
            validFrom: string;
        };
        UpdateTariffDto: {
            /** @example 89 */
            utilityRateCents?: number;
            /** @example 189 */
            baseRateCents?: number | null;
            /** @example 3500 */
            accessFeeCents?: number;
            /** @example 25 */
            idleFeeCentsPerMinute?: number;
            /** @example 3000 */
            idleFeeCapCents?: number;
            /** @example 10 */
            gracePeriodMinutes?: number;
        };
        /** @enum {string} */
        ChargingLimitType: "ENERGY" | "AMOUNT" | "FULL" | "PERCENT";
        ChargingLimitRequestDto: {
            type: components["schemas"]["ChargingLimitType"];
            /**
             * @description Required for ENERGY (kWh, up to 3 decimals), AMOUNT (integer cents) and PERCENT (target state of charge, integer from 1 to 100 above the current one of the vehicle)
             * @example 10
             */
            value?: number;
        };
        StartSessionRequestDto: {
            /** Format: uuid */
            chargePointId: string;
            /** @description Defaults to FULL */
            limit?: components["schemas"]["ChargingLimitRequestDto"];
        };
        /**
         * @description AWAITING_PAYMENT until the card hold is authorized (commercial points only), PENDING while the charger starts, ACTIVE while charging, GRACE after the battery is full (no fee), IDLE once the grace period ends (idle fee per minute up to the cap), CLOSED when ended by the driver, INTERRUPTED when it never charged (payment canceled or expired, charger failure)
         * @enum {string}
         */
        ChargingSessionStatus: "AWAITING_PAYMENT" | "PENDING" | "ACTIVE" | "GRACE" | "IDLE" | "CLOSED" | "INTERRUPTED";
        SessionChargePointDto: {
            /** Format: uuid */
            id: string;
            /** @example L1-01 */
            code: string;
            /** @example Garagem L1 · Vaga 12 */
            name: string;
        };
        SessionLimitDto: {
            type: components["schemas"]["ChargingLimitType"];
            /** @example 10 */
            energyKwh: number | null;
            /** @example 2000 */
            amountCents: number | null;
            /**
             * @description Target state of charge of PERCENT limits
             * @example 80
             */
            socPercent: number | null;
        };
        /**
         * @description PENDING_AUTHORIZATION until the card is confirmed, AUTHORIZED while the hold is active, CAPTURED with the final amount, CANCELED when the hold is released, FAILED when the card was declined (the driver may retry), REFUNDED when the captured amount was refunded in full (autoRefund accounts)
         * @enum {string}
         */
        PaymentStatus: "PENDING_AUTHORIZATION" | "AUTHORIZED" | "CAPTURED" | "CANCELED" | "FAILED" | "REFUNDED";
        SessionPaymentDto: {
            /** @example pi_3Q0abc123 */
            paymentIntentId: string;
            /** @description Stripe mode of the payment, taken from the paymentMode of the driver when the session started */
            mode: components["schemas"]["PaymentMode"];
            /** @description PENDING_AUTHORIZATION until the card is confirmed, AUTHORIZED while the hold is active, CAPTURED with the final amount, CANCELED when the hold is released, FAILED when the card was declined (the driver may retry), REFUNDED when the captured amount was refunded in full (autoRefund accounts) */
            status: components["schemas"]["PaymentStatus"];
            /** @example BRL */
            currency: string;
            /**
             * @description Amount held on the card (pre-authorization)
             * @example 20040
             */
            authorizedCents: number;
            /**
             * @description Final amount charged, set once captured
             * @example 1041
             */
            capturedCents: number | null;
            /**
             * @description Decline code of the last failed attempt
             * @example card_declined
             */
            failureCode: string | null;
            /** Format: date-time */
            authorizedAt: string | null;
            /** Format: date-time */
            capturedAt: string | null;
            /** Format: date-time */
            canceledAt: string | null;
            /**
             * @description Amount refunded to the card, set once refunded
             * @example 1041
             */
            refundedCents: number | null;
            /** Format: date-time */
            refundedAt: string | null;
        };
        PaymentSheetDto: {
            /**
             * @description initPaymentSheet paymentIntentClientSecret
             * @example pi_3Q0abc123_secret_xyz
             */
            paymentIntentClientSecret: string;
            /**
             * @description initPaymentSheet customerId
             * @example cus_Q0abc123
             */
            customerId: string;
            /**
             * @description initPaymentSheet customerEphemeralKeySecret
             * @example ek_test_abc123
             */
            customerEphemeralKeySecret: string;
            /**
             * @description Stripe publishable key for initStripe, or null to use the key bundled with the app
             * @example pk_test_abc123
             */
            publishableKey: string | null;
            /** @example EV ChargeOps */
            merchantDisplayName: string;
        };
        StartSessionResponseDto: {
            /** Format: uuid */
            id: string;
            /** @description AWAITING_PAYMENT until the card hold is authorized (commercial points only), PENDING while the charger starts, ACTIVE while charging, GRACE after the battery is full (no fee), IDLE once the grace period ends (idle fee per minute up to the cap), CLOSED when ended by the driver, INTERRUPTED when it never charged (payment canceled or expired, charger failure) */
            status: components["schemas"]["ChargingSessionStatus"];
            chargePoint: components["schemas"]["SessionChargePointDto"];
            /** Format: uuid */
            organizationId: string;
            /** @example B · 42 */
            unitLabel: string | null;
            regime: components["schemas"]["ChargePointType"];
            limit: components["schemas"]["SessionLimitDto"];
            /** @example 29 */
            targetEnergyKwh: number | null;
            /** Format: date-time */
            startedAt: string;
            /** Format: date-time */
            chargingEndedAt: string | null;
            /**
             * Format: date-time
             * @description Real time when the free grace period ends, set once charging ends; schedule the reminder to unplug for this instant
             */
            graceEndsAt: string | null;
            /**
             * Format: date-time
             * @description Real time when the idle fee starts to accrue (same instant as graceEndsAt)
             */
            idleStartsAt: string | null;
            /**
             * Format: date-time
             * @description Real time when the idle fee reaches its cap, null without an idle fee
             */
            idleFeeCapReachedAt: string | null;
            /**
             * Format: date-time
             * @description Real time when charging is expected to end, projected from the simulation model while ACTIVE and equal to chargingEndedAt in GRACE or IDLE; recomputed from the current session state on every read, null before the charger starts, after the session ends or when the charger cannot predict it. Schedule the charging complete reminder for this instant
             */
            projectedChargingEndsAt: string | null;
            /**
             * Format: date-time
             * @description Real time when the free grace period is expected to end (projectedChargingEndsAt plus the grace period), equal to graceEndsAt once charging ended
             */
            projectedGraceEndsAt: string | null;
            /**
             * Format: date-time
             * @description Real time when the idle fee is expected to start (same instant as projectedGraceEndsAt), equal to idleStartsAt once charging ended
             */
            projectedIdleStartsAt: string | null;
            /**
             * Format: date-time
             * @description Real time when the idle fee is expected to reach its cap, null without an idle fee
             */
            projectedIdleFeeCapReachedAt: string | null;
            /** Format: date-time */
            endedAt: string | null;
            /** @example 11.76 */
            energyKwh: number;
            /** @example 7 */
            powerKw: number;
            /** @example 7 */
            allocatedPowerKw: number;
            /** @example 66 */
            socPercent: number | null;
            /**
             * @description Price per kWh locked at start
             * @example 89
             */
            lockedRateCents: number;
            /** @example 1 */
            demandFactor: number;
            demandFactorSource: components["schemas"]["DemandFactorSource"];
            /** @description Version of the ML model that produced the demand factor */
            demandModelVersion: string | null;
            /** @example 1047 */
            energyCostCents: number;
            /** @example 10 */
            gracePeriodMinutes: number;
            /** @example 25 */
            idleFeeCentsPerMinute: number;
            /** @example 3000 */
            idleFeeCapCents: number;
            /** @example 0 */
            idleMinutes: number;
            /** @example 0 */
            idleFeeCents: number;
            /** @example 1047 */
            totalCents: number;
            /** @description Anomaly score from the ML service, set when the session closes */
            anomalyScore: number | null;
            isAnomaly: boolean | null;
            /**
             * @description Simulated seconds per real second for this session (1 with real chargers)
             * @example 60
             */
            simulationSpeed: number;
            /** @description Card payment of commercial sessions (Stripe), null for private sessions billed through the monthly cost sharing */
            payment: components["schemas"]["SessionPaymentDto"] | null;
            /** @description Parameters for the Stripe PaymentSheet when the session is AWAITING_PAYMENT (commercial points), null otherwise */
            paymentSheet: components["schemas"]["PaymentSheetDto"] | null;
        };
        SessionResponseDto: {
            /** Format: uuid */
            id: string;
            /** @description AWAITING_PAYMENT until the card hold is authorized (commercial points only), PENDING while the charger starts, ACTIVE while charging, GRACE after the battery is full (no fee), IDLE once the grace period ends (idle fee per minute up to the cap), CLOSED when ended by the driver, INTERRUPTED when it never charged (payment canceled or expired, charger failure) */
            status: components["schemas"]["ChargingSessionStatus"];
            chargePoint: components["schemas"]["SessionChargePointDto"];
            /** Format: uuid */
            organizationId: string;
            /** @example B · 42 */
            unitLabel: string | null;
            regime: components["schemas"]["ChargePointType"];
            limit: components["schemas"]["SessionLimitDto"];
            /** @example 29 */
            targetEnergyKwh: number | null;
            /** Format: date-time */
            startedAt: string;
            /** Format: date-time */
            chargingEndedAt: string | null;
            /**
             * Format: date-time
             * @description Real time when the free grace period ends, set once charging ends; schedule the reminder to unplug for this instant
             */
            graceEndsAt: string | null;
            /**
             * Format: date-time
             * @description Real time when the idle fee starts to accrue (same instant as graceEndsAt)
             */
            idleStartsAt: string | null;
            /**
             * Format: date-time
             * @description Real time when the idle fee reaches its cap, null without an idle fee
             */
            idleFeeCapReachedAt: string | null;
            /**
             * Format: date-time
             * @description Real time when charging is expected to end, projected from the simulation model while ACTIVE and equal to chargingEndedAt in GRACE or IDLE; recomputed from the current session state on every read, null before the charger starts, after the session ends or when the charger cannot predict it. Schedule the charging complete reminder for this instant
             */
            projectedChargingEndsAt: string | null;
            /**
             * Format: date-time
             * @description Real time when the free grace period is expected to end (projectedChargingEndsAt plus the grace period), equal to graceEndsAt once charging ended
             */
            projectedGraceEndsAt: string | null;
            /**
             * Format: date-time
             * @description Real time when the idle fee is expected to start (same instant as projectedGraceEndsAt), equal to idleStartsAt once charging ended
             */
            projectedIdleStartsAt: string | null;
            /**
             * Format: date-time
             * @description Real time when the idle fee is expected to reach its cap, null without an idle fee
             */
            projectedIdleFeeCapReachedAt: string | null;
            /** Format: date-time */
            endedAt: string | null;
            /** @example 11.76 */
            energyKwh: number;
            /** @example 7 */
            powerKw: number;
            /** @example 7 */
            allocatedPowerKw: number;
            /** @example 66 */
            socPercent: number | null;
            /**
             * @description Price per kWh locked at start
             * @example 89
             */
            lockedRateCents: number;
            /** @example 1 */
            demandFactor: number;
            demandFactorSource: components["schemas"]["DemandFactorSource"];
            /** @description Version of the ML model that produced the demand factor */
            demandModelVersion: string | null;
            /** @example 1047 */
            energyCostCents: number;
            /** @example 10 */
            gracePeriodMinutes: number;
            /** @example 25 */
            idleFeeCentsPerMinute: number;
            /** @example 3000 */
            idleFeeCapCents: number;
            /** @example 0 */
            idleMinutes: number;
            /** @example 0 */
            idleFeeCents: number;
            /** @example 1047 */
            totalCents: number;
            /** @description Anomaly score from the ML service, set when the session closes */
            anomalyScore: number | null;
            isAnomaly: boolean | null;
            /**
             * @description Simulated seconds per real second for this session (1 with real chargers)
             * @example 60
             */
            simulationSpeed: number;
            /** @description Card payment of commercial sessions (Stripe), null for private sessions billed through the monthly cost sharing */
            payment: components["schemas"]["SessionPaymentDto"] | null;
        };
        ActiveSessionResponseDto: {
            /** @description The open session of the user, or null */
            session: components["schemas"]["SessionResponseDto"] | null;
        };
        SessionPageResponseDto: {
            items: components["schemas"]["SessionResponseDto"][];
            /** @example 42 */
            total: number;
            /** @example 1 */
            page: number;
            /** @example 20 */
            pageSize: number;
        };
        MeterReadingDto: {
            /** Format: date-time */
            at: string;
            /** @example 5.833 */
            energyKwh: number;
            /** @example 7 */
            powerKw: number;
            /** @example 54 */
            socPercent: number | null;
        };
        SessionDetailResponseDto: {
            /** Format: uuid */
            id: string;
            /** @description AWAITING_PAYMENT until the card hold is authorized (commercial points only), PENDING while the charger starts, ACTIVE while charging, GRACE after the battery is full (no fee), IDLE once the grace period ends (idle fee per minute up to the cap), CLOSED when ended by the driver, INTERRUPTED when it never charged (payment canceled or expired, charger failure) */
            status: components["schemas"]["ChargingSessionStatus"];
            chargePoint: components["schemas"]["SessionChargePointDto"];
            /** Format: uuid */
            organizationId: string;
            /** @example B · 42 */
            unitLabel: string | null;
            regime: components["schemas"]["ChargePointType"];
            limit: components["schemas"]["SessionLimitDto"];
            /** @example 29 */
            targetEnergyKwh: number | null;
            /** Format: date-time */
            startedAt: string;
            /** Format: date-time */
            chargingEndedAt: string | null;
            /**
             * Format: date-time
             * @description Real time when the free grace period ends, set once charging ends; schedule the reminder to unplug for this instant
             */
            graceEndsAt: string | null;
            /**
             * Format: date-time
             * @description Real time when the idle fee starts to accrue (same instant as graceEndsAt)
             */
            idleStartsAt: string | null;
            /**
             * Format: date-time
             * @description Real time when the idle fee reaches its cap, null without an idle fee
             */
            idleFeeCapReachedAt: string | null;
            /**
             * Format: date-time
             * @description Real time when charging is expected to end, projected from the simulation model while ACTIVE and equal to chargingEndedAt in GRACE or IDLE; recomputed from the current session state on every read, null before the charger starts, after the session ends or when the charger cannot predict it. Schedule the charging complete reminder for this instant
             */
            projectedChargingEndsAt: string | null;
            /**
             * Format: date-time
             * @description Real time when the free grace period is expected to end (projectedChargingEndsAt plus the grace period), equal to graceEndsAt once charging ended
             */
            projectedGraceEndsAt: string | null;
            /**
             * Format: date-time
             * @description Real time when the idle fee is expected to start (same instant as projectedGraceEndsAt), equal to idleStartsAt once charging ended
             */
            projectedIdleStartsAt: string | null;
            /**
             * Format: date-time
             * @description Real time when the idle fee is expected to reach its cap, null without an idle fee
             */
            projectedIdleFeeCapReachedAt: string | null;
            /** Format: date-time */
            endedAt: string | null;
            /** @example 11.76 */
            energyKwh: number;
            /** @example 7 */
            powerKw: number;
            /** @example 7 */
            allocatedPowerKw: number;
            /** @example 66 */
            socPercent: number | null;
            /**
             * @description Price per kWh locked at start
             * @example 89
             */
            lockedRateCents: number;
            /** @example 1 */
            demandFactor: number;
            demandFactorSource: components["schemas"]["DemandFactorSource"];
            /** @description Version of the ML model that produced the demand factor */
            demandModelVersion: string | null;
            /** @example 1047 */
            energyCostCents: number;
            /** @example 10 */
            gracePeriodMinutes: number;
            /** @example 25 */
            idleFeeCentsPerMinute: number;
            /** @example 3000 */
            idleFeeCapCents: number;
            /** @example 0 */
            idleMinutes: number;
            /** @example 0 */
            idleFeeCents: number;
            /** @example 1047 */
            totalCents: number;
            /** @description Anomaly score from the ML service, set when the session closes */
            anomalyScore: number | null;
            isAnomaly: boolean | null;
            /**
             * @description Simulated seconds per real second for this session (1 with real chargers)
             * @example 60
             */
            simulationSpeed: number;
            /** @description Card payment of commercial sessions (Stripe), null for private sessions billed through the monthly cost sharing */
            payment: components["schemas"]["SessionPaymentDto"] | null;
            /** @description Meter readings recorded so far, oldest first */
            readings: components["schemas"]["MeterReadingDto"][];
        };
        OrganizationSessionDriverDto: {
            /** Format: uuid */
            id: string;
            /** @example Ana Ribeiro */
            name: string;
        };
        /**
         * @description Manager review of the anomaly flag: PENDING_REVIEW for flagged sessions not reviewed yet, CONFIRMED or DISMISSED after the review, null when the session is not flagged. Billing never changes with the review
         * @enum {string}
         */
        AnomalyReviewStatus: "PENDING_REVIEW" | "CONFIRMED" | "DISMISSED";
        OrganizationSessionDetailResponseDto: {
            /** Format: uuid */
            id: string;
            /** @description AWAITING_PAYMENT until the card hold is authorized (commercial points only), PENDING while the charger starts, ACTIVE while charging, GRACE after the battery is full (no fee), IDLE once the grace period ends (idle fee per minute up to the cap), CLOSED when ended by the driver, INTERRUPTED when it never charged (payment canceled or expired, charger failure) */
            status: components["schemas"]["ChargingSessionStatus"];
            chargePoint: components["schemas"]["SessionChargePointDto"];
            /** Format: uuid */
            organizationId: string;
            /** @example B · 42 */
            unitLabel: string | null;
            regime: components["schemas"]["ChargePointType"];
            limit: components["schemas"]["SessionLimitDto"];
            /** @example 29 */
            targetEnergyKwh: number | null;
            /** Format: date-time */
            startedAt: string;
            /** Format: date-time */
            chargingEndedAt: string | null;
            /**
             * Format: date-time
             * @description Real time when the free grace period ends, set once charging ends; schedule the reminder to unplug for this instant
             */
            graceEndsAt: string | null;
            /**
             * Format: date-time
             * @description Real time when the idle fee starts to accrue (same instant as graceEndsAt)
             */
            idleStartsAt: string | null;
            /**
             * Format: date-time
             * @description Real time when the idle fee reaches its cap, null without an idle fee
             */
            idleFeeCapReachedAt: string | null;
            /**
             * Format: date-time
             * @description Real time when charging is expected to end, projected from the simulation model while ACTIVE and equal to chargingEndedAt in GRACE or IDLE; recomputed from the current session state on every read, null before the charger starts, after the session ends or when the charger cannot predict it. Schedule the charging complete reminder for this instant
             */
            projectedChargingEndsAt: string | null;
            /**
             * Format: date-time
             * @description Real time when the free grace period is expected to end (projectedChargingEndsAt plus the grace period), equal to graceEndsAt once charging ended
             */
            projectedGraceEndsAt: string | null;
            /**
             * Format: date-time
             * @description Real time when the idle fee is expected to start (same instant as projectedGraceEndsAt), equal to idleStartsAt once charging ended
             */
            projectedIdleStartsAt: string | null;
            /**
             * Format: date-time
             * @description Real time when the idle fee is expected to reach its cap, null without an idle fee
             */
            projectedIdleFeeCapReachedAt: string | null;
            /** Format: date-time */
            endedAt: string | null;
            /** @example 11.76 */
            energyKwh: number;
            /** @example 7 */
            powerKw: number;
            /** @example 7 */
            allocatedPowerKw: number;
            /** @example 66 */
            socPercent: number | null;
            /**
             * @description Price per kWh locked at start
             * @example 89
             */
            lockedRateCents: number;
            /** @example 1 */
            demandFactor: number;
            demandFactorSource: components["schemas"]["DemandFactorSource"];
            /** @description Version of the ML model that produced the demand factor */
            demandModelVersion: string | null;
            /** @example 1047 */
            energyCostCents: number;
            /** @example 10 */
            gracePeriodMinutes: number;
            /** @example 25 */
            idleFeeCentsPerMinute: number;
            /** @example 3000 */
            idleFeeCapCents: number;
            /** @example 0 */
            idleMinutes: number;
            /** @example 0 */
            idleFeeCents: number;
            /** @example 1047 */
            totalCents: number;
            /** @description Anomaly score from the ML service, set when the session closes */
            anomalyScore: number | null;
            isAnomaly: boolean | null;
            /**
             * @description Simulated seconds per real second for this session (1 with real chargers)
             * @example 60
             */
            simulationSpeed: number;
            /** @description Card payment of commercial sessions (Stripe), null for private sessions billed through the monthly cost sharing */
            payment: components["schemas"]["SessionPaymentDto"] | null;
            /** @description Meter readings recorded so far, oldest first */
            readings: components["schemas"]["MeterReadingDto"][];
            driver: components["schemas"]["OrganizationSessionDriverDto"];
            /** @description Version of the ML model that produced the anomaly score */
            anomalyModelVersion: string | null;
            /** @description Manager review of the anomaly flag: PENDING_REVIEW for flagged sessions not reviewed yet, CONFIRMED or DISMISSED after the review, null when the session is not flagged. Billing never changes with the review */
            anomalyReviewStatus: components["schemas"]["AnomalyReviewStatus"] | null;
            /** @example Morador confirmou a recarga de um veículo visitante */
            anomalyReviewNote: string | null;
            /** Format: date-time */
            anomalyReviewedAt: string | null;
            /**
             * Format: uuid
             * @description Manager who reviewed the anomaly
             */
            anomalyReviewedById: string | null;
        };
        /**
         * @description CONFIRMED keeps the session as an anomaly, DISMISSED marks it as a false positive
         * @enum {string}
         */
        AnomalyReviewDecision: "CONFIRMED" | "DISMISSED";
        ReviewSessionAnomalyRequestDto: {
            /** @description CONFIRMED keeps the session as an anomaly, DISMISSED marks it as a false positive */
            status: components["schemas"]["AnomalyReviewDecision"];
            /** @example Morador confirmou a recarga de um veículo visitante */
            note?: string;
        };
        WebhookReceiptDto: {
            /** @example true */
            received: boolean;
            /**
             * @description False when the event type is ignored or was already processed
             * @example true
             */
            processed: boolean;
        };
        StatementLineDto: {
            /** @example 2 */
            sessionsCount: number;
            /** @example 15.81 */
            energyKwh: number;
            /**
             * @description Energy at the locked rates
             * @example 1407
             */
            energyCents: number;
            /** @example 3500 */
            accessFeeCents: number;
            /** @example 150 */
            idleFeeCents: number;
            /** @example 5057 */
            totalCents: number;
            /**
             * @description Null for sessions of members without a unit
             * @example B · 42
             */
            unitLabel: string | null;
        };
        StatementTotalsDto: {
            /** @example 2 */
            sessionsCount: number;
            /** @example 15.81 */
            energyKwh: number;
            /**
             * @description Energy at the locked rates
             * @example 1407
             */
            energyCents: number;
            /** @example 3500 */
            accessFeeCents: number;
            /** @example 150 */
            idleFeeCents: number;
            /** @example 5057 */
            totalCents: number;
            /** @example 27 */
            unitsCount: number;
        };
        MonthlyStatementResponseDto: {
            /** @example 2026-08 */
            month: string;
            /** Format: date-time */
            periodStart: string;
            /** Format: date-time */
            periodEnd: string;
            /**
             * @description Monthly access fee charged to each unit with a vehicle
             * @example 3500
             */
            accessFeeCents: number;
            lines: components["schemas"]["StatementLineDto"][];
            totals: components["schemas"]["StatementTotalsDto"];
        };
        StatementOrganizationDto: {
            /** Format: uuid */
            id: string;
            /** @example Residencial Aclimação */
            name: string;
        };
        /**
         * @description OPEN while the month is running (amounts may still grow), CLOSED once it ended
         * @enum {string}
         */
        StatementStatus: "OPEN" | "CLOSED";
        DailyEnergyDto: {
            /**
             * Format: date
             * @example 2026-08-03
             */
            date: string;
            /** @example 11.76 */
            energyKwh: number;
        };
        MyMonthlyStatementResponseDto: {
            organization: components["schemas"]["StatementOrganizationDto"];
            /** @example B · 42 */
            unitLabel: string;
            /** @example 2026-08 */
            month: string;
            /** @description OPEN while the month is running (amounts may still grow), CLOSED once it ended */
            status: components["schemas"]["StatementStatus"];
            /**
             * Format: date-time
             * @description End of the month in America/Sao_Paulo
             */
            closesAt: string;
            /** @example 15.81 */
            energyKwh: number;
            /**
             * @description Energy at the locked rates
             * @example 1407
             */
            energyCents: number;
            /**
             * @description Utility rate per kWh of the condominium tariff in force at the end of the month, null without a tariff
             * @example 89
             */
            utilityRateCents: number | null;
            /**
             * @description Monthly access fee, charged when the unit has a vehicle
             * @example 3500
             */
            accessFeeCents: number;
            /** @example 150 */
            idleFeeCents: number;
            /** @example 5057 */
            totalCents: number;
            /** @example 2 */
            sessionsCount: number;
            /** @description Energy of the unit per day of the month, every day included (zero without charges) */
            dailyEnergy: components["schemas"]["DailyEnergyDto"][];
        };
        OrganizationSessionPointDto: {
            /** Format: uuid */
            id: string;
            /** @example L1-01 */
            code: string;
            /** @example Garagem L1 · Vaga 12 */
            name: string;
        };
        OrganizationSessionDto: {
            /** Format: uuid */
            id: string;
            status: components["schemas"]["ChargingSessionStatus"];
            regime: components["schemas"]["ChargePointType"];
            chargePoint: components["schemas"]["OrganizationSessionPointDto"];
            driver: components["schemas"]["OrganizationSessionDriverDto"];
            /** @example B · 42 */
            unitLabel: string | null;
            /** Format: date-time */
            startedAt: string;
            /** Format: date-time */
            chargingEndedAt: string | null;
            /** Format: date-time */
            endedAt: string | null;
            /** @example 11.76 */
            energyKwh: number;
            /** @example 89 */
            lockedRateCents: number;
            /** @example 1 */
            demandFactor: number;
            /** @example 1047 */
            energyCostCents: number;
            /** @example 0 */
            idleMinutes: number;
            /** @example 0 */
            idleFeeCents: number;
            /** @example 1047 */
            totalCents: number;
            /** @description Anomaly score from the ML service, when available */
            anomalyScore: number | null;
            isAnomaly: boolean | null;
            /** @description Manager review of the anomaly flag: PENDING_REVIEW for flagged sessions not reviewed yet, CONFIRMED or DISMISSED after the review, null when the session is not flagged. Billing never changes with the review */
            anomalyReviewStatus: components["schemas"]["AnomalyReviewStatus"] | null;
            /** @example Morador confirmou a recarga de um veículo visitante */
            anomalyReviewNote: string | null;
            /** Format: date-time */
            anomalyReviewedAt: string | null;
            /**
             * Format: uuid
             * @description Manager who reviewed the anomaly
             */
            anomalyReviewedById: string | null;
        };
        OrganizationSessionPageDto: {
            items: components["schemas"]["OrganizationSessionDto"][];
            /** @example 120 */
            total: number;
            /** @example 1 */
            page: number;
            /** @example 20 */
            pageSize: number;
        };
        MonthComparisonDto: {
            /** @example 2026-07 */
            month: string;
            /** @example 1190.2 */
            energyKwh: number;
            /** @example 96 */
            sessionsCount: number;
            /**
             * @description Energy cost of the sessions started in the month
             * @example 121870
             */
            energyCents: number;
            /**
             * @description Total of the sessions started in the month (energy plus idle fees)
             * @example 128420
             */
            totalCents: number;
        };
        MonthPeakDto: {
            /**
             * @description Highest simultaneous charging demand of the sessions started in the month, without the common area reserve
             * @example 36
             */
            demandKw: number;
            /**
             * Format: date-time
             * @description When the peak started, null without charging in the month
             */
            at: string | null;
        };
        SiteCapacityDto: {
            /** @example 75 */
            contractedDemandKw: number;
            /** @example 11.5 */
            commonAreaReserveKw: number;
            /**
             * @description Power of the sessions charging now
             * @example 14
             */
            chargingDemandKw: number;
            /**
             * @description Common area reserve plus the sessions charging now
             * @example 25.5
             */
            currentDemandKw: number;
            /**
             * @description Current demand over contracted
             * @example 34
             */
            utilizationPercent: number;
            /**
             * @description Average over the days with sessions of the daily peak (reserve plus overlapping sessions)
             * @example 40.2
             */
            averagePeakDemandKw: number;
            /** @example 53.6 */
            averagePeakUtilizationPercent: number;
            /** @description True when the average daily peak is above 80% of the contracted demand */
            upgradeRecommended: boolean;
        };
        WeeklyEnergyDto: {
            /**
             * @description Week of the month (days 1-7 = 1)
             * @example 1
             */
            week: number;
            /** @example 218.4 */
            energyKwh: number;
        };
        RecentAnomalyDto: {
            /** Format: uuid */
            sessionId: string;
            status: components["schemas"]["ChargingSessionStatus"];
            regime: components["schemas"]["ChargePointType"];
            chargePoint: components["schemas"]["OrganizationSessionPointDto"];
            driver: components["schemas"]["OrganizationSessionDriverDto"];
            /** @example B · 42 */
            unitLabel: string | null;
            /** Format: date-time */
            startedAt: string;
            /** Format: date-time */
            endedAt: string | null;
            /** @example 41 */
            energyKwh: number;
            /** @example 0 */
            idleMinutes: number;
            /** @example 3649 */
            totalCents: number;
            /** @example 0.565 */
            anomalyScore: number | null;
            /** @example v1 */
            anomalyModelVersion: string | null;
            /** @description Manager review of the anomaly flag: PENDING_REVIEW for flagged sessions not reviewed yet, CONFIRMED or DISMISSED after the review, null when the session is not flagged. Billing never changes with the review */
            anomalyReviewStatus: components["schemas"]["AnomalyReviewStatus"] | null;
            /** @example Morador confirmou a recarga de um veículo visitante */
            anomalyReviewNote: string | null;
            /** Format: date-time */
            anomalyReviewedAt: string | null;
            /**
             * Format: uuid
             * @description Manager who reviewed the anomaly
             */
            anomalyReviewedById: string | null;
        };
        OverviewActiveSessionDto: {
            /** Format: uuid */
            sessionId: string;
            status: components["schemas"]["ChargingSessionStatus"];
            /**
             * Format: date-time
             * @description When the free grace period ends (set once charging ended, in GRACE and IDLE); the idle fee starts at this instant
             */
            graceEndsAt: string | null;
        };
        OverviewChargePointDto: {
            /** Format: uuid */
            id: string;
            /** @example L1-01 */
            code: string;
            /** @example Garagem L1 · Vaga 12 */
            name: string;
            type: components["schemas"]["ChargePointType"];
            /** @example 7 */
            maxPowerKw: number;
            /**
             * Format: uri
             * @description Absolute URL of a photo of the point, null without one
             * @example https://app.evchargeops.com.br/media/points/garage-a.webp
             */
            photoUrl: string | null;
            status: components["schemas"]["ChargePointStatus"];
            /** @description Current price of the point; null when no tariff is configured */
            pricing: components["schemas"]["ChargePointPricingDto"] | null;
            /**
             * @description Power delivered now by the session charging at the point (from its latest telemetry), 0 when it is not charging
             * @example 6.4
             */
            currentPowerKw: number;
            /** @description Open session at the point, null when it is free */
            activeSession: components["schemas"]["OverviewActiveSessionDto"] | null;
        };
        OrganizationOverviewResponseDto: {
            /** @example 2026-08 */
            month: string;
            /** @example 1284.6 */
            energyKwh: number;
            /** @example 102 */
            sessionsCount: number;
            /**
             * @description Energy cost of the sessions started in the month, every regime
             * @example 128930
             */
            energyCents: number;
            /**
             * @description Total of the sessions started in the month (energy plus idle fees), every regime
             * @example 136210
             */
            totalCents: number;
            /** @description Same totals for the previous month, for month over month deltas */
            previousMonth: components["schemas"]["MonthComparisonDto"];
            /**
             * @description Sessions of the month at commercial points of the organization or by drivers who are not members
             * @example 14
             */
            visitorSessionsCount: number;
            monthPeak: components["schemas"]["MonthPeakDto"];
            /**
             * @description Sessions open now (charging, grace or idle)
             * @example 1
             */
            activeSessionsCount: number;
            /**
             * @description Total of the monthly statement
             * @example 198734
             */
            costSharingTotalCents: number;
            /**
             * @description Card revenue of the commercial points this month
             * @example 45210
             */
            commercialRevenueCents: number;
            /** @example 21 */
            unitsWithVehicle: number;
            /** @example 18 */
            unitsWithConsumption: number;
            capacity: components["schemas"]["SiteCapacityDto"];
            energyByWeek: components["schemas"]["WeeklyEnergyDto"][];
            /**
             * @description Sessions of the month flagged as anomalous
             * @example 3
             */
            anomaliesCount: number;
            /**
             * @description Flagged sessions still waiting for a manager review (PENDING_REVIEW) that started before the end of the month
             * @example 2
             */
            anomaliesPendingReviewCount: number;
            /** @description Latest sessions flagged as anomalous that started before the end of the month, newest first (up to 5) */
            recentAnomalies: components["schemas"]["RecentAnomalyDto"][];
            /** @description Charge points of the organization with their current price */
            chargePoints: components["schemas"]["OverviewChargePointDto"][];
        };
        /** @enum {string} */
        ConsentPurpose: "ESSENTIAL_SERVICE" | "BILLING_SHARING" | "USAGE_ANALYTICS" | "MARKETING_COMMUNICATIONS";
        ConsentPurposeStateDto: {
            purpose: components["schemas"]["ConsentPurpose"];
            /** @description Required purposes are granted on acceptance and cannot be revoked */
            required: boolean;
            /** @example Rateio com o condomínio */
            title: string;
            /** @example Compartilhar com a gestão do seu condomínio a energia, o horário e o valor de cada recarga para o rateio na taxa condominial. */
            description: string;
            /** @description Latest choice; false when never recorded */
            granted: boolean;
            /**
             * @description Terms version of the latest choice
             * @example 2026-10-07
             */
            termsVersion: string | null;
            /** Format: date-time */
            recordedAt: string | null;
        };
        MyConsentsResponseDto: {
            /**
             * @description Current terms version
             * @example 2026-10-07
             */
            termsVersion: string;
            /**
             * @description Terms version under which the required purposes were last granted
             * @example 2026-10-07
             */
            acceptedTermsVersion: string | null;
            /** @description True when the user has not accepted the current terms version and must accept them again */
            mustAccept: boolean;
            purposes: components["schemas"]["ConsentPurposeStateDto"][];
        };
        ConsentChoiceDto: {
            purpose: components["schemas"]["ConsentPurpose"];
            granted: boolean;
        };
        UpdateMyConsentsRequestDto: {
            /**
             * @description Terms version shown to the user; must be the current one returned by getMyConsents
             * @example 2026-10-07
             */
            termsVersion: string;
            /** @description Choices to record; required purposes are always granted and omitted optional purposes keep their latest choice */
            consents: components["schemas"]["ConsentChoiceDto"][];
        };
        /** @enum {string} */
        IdentityProvider: "GOOGLE" | "APPLE";
        ExportedIdentityDto: {
            provider: components["schemas"]["IdentityProvider"];
            email: string | null;
            /** Format: date-time */
            createdAt: string;
        };
        ExportedProfileDto: {
            /** Format: uuid */
            id: string;
            /** @example Ana Souza */
            name: string;
            /** Format: email */
            email: string;
            role: components["schemas"]["Role"];
            /** Format: date-time */
            emailVerifiedAt: string | null;
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            updatedAt: string;
            identities: components["schemas"]["ExportedIdentityDto"][];
        };
        ExportedOrganizationDto: {
            /** Format: uuid */
            id: string;
            name: string;
            type: components["schemas"]["OrganizationType"];
        };
        ExportedMembershipDto: {
            organization: components["schemas"]["ExportedOrganizationDto"];
            role: components["schemas"]["MembershipRole"];
            unitLabel: string | null;
            /** Format: date-time */
            createdAt: string;
        };
        ExportedChargePointDto: {
            /** Format: uuid */
            id: string;
            code: string;
            name: string;
        };
        ExportedPaymentDto: {
            status: components["schemas"]["PaymentStatus"];
            authorizedCents: number;
            capturedCents: number | null;
            /** @example BRL */
            currency: string;
        };
        ExportedSessionDto: {
            /** Format: uuid */
            id: string;
            chargePoint: components["schemas"]["ExportedChargePointDto"];
            /** Format: uuid */
            organizationId: string;
            unitLabel: string | null;
            regime: components["schemas"]["ChargePointType"];
            status: components["schemas"]["ChargingSessionStatus"];
            /** Format: date-time */
            startedAt: string;
            /** Format: date-time */
            chargingEndedAt: string | null;
            /** Format: date-time */
            endedAt: string | null;
            energyKwh: number;
            lockedRateCents: number;
            energyCostCents: number;
            idleMinutes: number;
            idleFeeCents: number;
            totalCents: number;
            payment: components["schemas"]["ExportedPaymentDto"] | null;
        };
        ExportedConsentDto: {
            purpose: components["schemas"]["ConsentPurpose"];
            granted: boolean;
            /** @example 2026-10-07 */
            termsVersion: string;
            /** Format: date-time */
            recordedAt: string;
        };
        /** @enum {string} */
        DeletionRequestStatus: "PENDING" | "COMPLETED";
        DeletionRequestResponseDto: {
            /** Format: uuid */
            id: string;
            status: components["schemas"]["DeletionRequestStatus"];
            reason: string | null;
            /** Format: date-time */
            requestedAt: string;
            /** Format: date-time */
            processedAt: string | null;
        };
        MyDataExportResponseDto: {
            /** Format: date-time */
            exportedAt: string;
            profile: components["schemas"]["ExportedProfileDto"];
            memberships: components["schemas"]["ExportedMembershipDto"][];
            /** @description Newest first */
            sessions: components["schemas"]["ExportedSessionDto"][];
            /** @description Full consent history, oldest first */
            consents: components["schemas"]["ExportedConsentDto"][];
            deletionRequests: components["schemas"]["DeletionRequestResponseDto"][];
        };
        RequestAccountDeletionRequestDto: {
            /** @example Mudei de condomínio */
            reason?: string;
        };
        DeleteMyAccountRequestDto: {
            /** @description Current password; required when the account has one (hasPassword), ignored for Google, Apple or email code accounts */
            password?: string;
            /**
             * @description Typed by the user to confirm the deletion
             * @example EXCLUIR
             * @enum {string}
             */
            confirm: "EXCLUIR";
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    registerPushToken: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RegisterPushTokenRequestDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PushTokenResponseDto"];
                };
            };
            /** @description Invalid token or platform */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    removePushToken: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                token: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Token removed */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    listMyNotifications: {
        parameters: {
            query?: {
                page?: number;
                pageSize?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["NotificationPageResponseDto"];
                };
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    markAllNotificationsRead: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReadAllNotificationsResponseDto"];
                };
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    markNotificationRead: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                notificationId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["NotificationResponseDto"];
                };
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Notification not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    register: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RegisterDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuthResponseDto"];
                };
            };
            /** @description Invalid payload */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Email already registered */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    login: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LoginDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuthResponseDto"];
                };
            };
            /** @description Invalid payload */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invalid credentials */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    refresh: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RefreshTokenDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuthResponseDto"];
                };
            };
            /** @description Invalid payload */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invalid, expired or revoked token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    logout: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RefreshTokenDto"];
            };
        };
        responses: {
            /** @description Refresh token revoked */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invalid payload */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getMe: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserResponseDto"];
                };
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    confirmEmailVerification: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ConfirmEmailVerificationDto"];
            };
        };
        responses: {
            /** @description Email verified */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invalid, expired or used token */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    resendEmailVerification: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Verification email sent unless the email is already verified */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    forgotPassword: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ForgotPasswordDto"];
            };
        };
        responses: {
            /** @description Always accepted, whether or not the email is registered */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invalid payload */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    resetPassword: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ResetPasswordDto"];
            };
        };
        responses: {
            /** @description Password updated and every session revoked */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invalid payload or invalid, expired or used token */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    requestEmailLogin: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RequestEmailLoginDto"];
            };
        };
        responses: {
            /** @description Always accepted, whether or not the email is registered */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invalid payload */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    verifyEmailLogin: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["VerifyEmailLoginDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuthResponseDto"];
                };
            };
            /** @description Invalid payload */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invalid, expired or locked code */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    loginWithGoogle: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GoogleLoginDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuthResponseDto"];
                };
            };
            /** @description Invalid payload */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invalid token or email not verified by Google */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    loginWithGoogleCode: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GoogleCodeLoginDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuthResponseDto"];
                };
            };
            /** @description Invalid payload */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invalid or expired code, invalid ID token or email not verified by Google */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Google authorization code flow is not configured (GOOGLE_CODE_FLOW_NOT_CONFIGURED) */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    loginWithApple: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AppleLoginDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuthResponseDto"];
                };
            };
            /** @description Invalid payload */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invalid token or email not verified by Apple */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    deleteMyAccount: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DeleteMyAccountRequestDto"];
            };
        };
        responses: {
            /** @description The completed deletion request */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DeletionRequestResponseDto"];
                };
            };
            /** @description Invalid payload (confirm must be EXCLUIR) or INVALID_PASSWORD: the password is missing or incorrect for an account with a password */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description LAST_MANAGER: the user is the only manager of an organization */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    updateMyProfile: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateMyProfileDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserResponseDto"];
                };
            };
            /** @description Invalid payload */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    changeMyPassword: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ChangeMyPasswordDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuthResponseDto"];
                };
            };
            /** @description Invalid payload or INVALID_CURRENT_PASSWORD: the current password is missing or incorrect */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    listMyOrganizations: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MyOrganizationDto"][];
                };
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    listOrganizationMembers: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                organizationId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OrganizationMemberDto"][];
                };
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Member without the required organization role */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Organization not found or user is not a member */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    listInvites: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                organizationId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InviteResponseDto"][];
                };
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Member without the required organization role */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Organization not found or user is not a member */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    createInvite: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                organizationId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateInviteDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InviteResponseDto"];
                };
            };
            /** @description Invalid payload */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Member without the required organization role */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Organization not found or user is not a member */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Email already belongs to a member (ALREADY_MEMBER) or has a pending invite (INVITE_ALREADY_PENDING) */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    resendInvite: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                organizationId: string;
                inviteId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InviteResponseDto"];
                };
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Member without the required organization role */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Organization not found or user is not a member */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invite already accepted or revoked, or the email is already a member or has another pending invite */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    revokeInvite: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                organizationId: string;
                inviteId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Invite revoked */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Member without the required organization role */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Organization not found or user is not a member */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invite already accepted */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getInvitePreview: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                token: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InvitePreviewDto"];
                };
            };
            /** @description Unknown invite token (INVITE_NOT_FOUND) */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    acceptInvite: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                token: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AcceptInviteDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuthResponseDto"];
                };
            };
            /** @description Invalid payload */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unknown invite token (INVITE_NOT_FOUND) */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Email already registered (EMAIL_ALREADY_REGISTERED): log in and use accept-authenticated */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invite expired (INVITE_EXPIRED), revoked (INVITE_REVOKED) or already accepted (INVITE_ALREADY_ACCEPTED) */
            410: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    acceptInviteAsCurrentUser: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                token: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Membership created */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invite sent to another email (INVITE_EMAIL_MISMATCH) */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unknown invite token (INVITE_NOT_FOUND) */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Already a member (ALREADY_MEMBER) */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Invite expired (INVITE_EXPIRED), revoked (INVITE_REVOKED) or already accepted (INVITE_ALREADY_ACCEPTED) */
            410: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Too many requests */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    listChargePoints: {
        parameters: {
            query?: {
                /** @description Only the points of this organization that the user can see: all of them for members, the commercial ones otherwise */
                organizationId?: string;
                /** @description Map viewport as minLng,minLat,maxLng,maxLat. When set, the response is a list of ChargePointMapItemResponseDto (light map items, nearest to the center first) instead of ChargePointResponseDto */
                bbox?: string;
                /** @description Maximum number of map items returned with bbox */
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChargePointResponseDto"][] | components["schemas"]["ChargePointMapItemResponseDto"][];
                };
            };
            /** @description Invalid filters */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    listChargePointClusters: {
        parameters: {
            query: {
                /** @description Map viewport as minLng,minLat,maxLng,maxLat */
                bbox: string;
                /** @description Map zoom level; each grid cell is a quarter of a 256 px map tile at this zoom (360 / 2^zoom / 4 degrees) */
                zoom: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChargePointClusterResponseDto"][];
                };
            };
            /** @description Invalid bbox or zoom */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getChargePoint: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                chargePointId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ChargePointResponseDto"];
                };
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Charge point not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    joinChargePointQueue: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                chargePointId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["QueueEntryResponseDto"];
                };
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Charge point not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description CHARGE_POINT_AVAILABLE, CHARGE_POINT_OFFLINE, QUEUE_OWN_SESSION, ALREADY_IN_QUEUE or ACTIVE_QUEUE_EXISTS (one queue per user) */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    leaveChargePointQueue: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                chargePointId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Left the queue */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description QUEUE_ENTRY_NOT_FOUND */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getMyQueueEntry: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                chargePointId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["QueueEntryResponseDto"];
                };
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Charge point not found or QUEUE_ENTRY_NOT_FOUND */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getOrganizationTariff: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                organizationId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TariffResponseDto"];
                };
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Member without the required organization role */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /**
             * @description Tariff not configured
             *
             *     Organization not found or user is not a member
             */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    updateOrganizationTariff: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                organizationId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateTariffDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TariffResponseDto"];
                };
            };
            /** @description Invalid payload */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Member without the required organization role */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Organization not found or user is not a member */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    listMySessions: {
        parameters: {
            query?: {
                page?: number;
                pageSize?: number;
                /** @description Keeps only the sessions started in this calendar month in America/Sao_Paulo */
                month?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SessionPageResponseDto"];
                };
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    startSession: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["StartSessionRequestDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["StartSessionResponseDto"];
                };
            };
            /** @description Invalid payload or limit */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Charge point not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description CHARGE_POINT_BUSY, CHARGE_POINT_RESERVED (free but reserved for the head of the queue), ACTIVE_SESSION_EXISTS, CHARGE_POINT_OFFLINE, TARIFF_NOT_CONFIGURED or BUILDING_CAPACITY_EXCEEDED */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description PAYMENT_PROVIDER_ERROR: Stripe did not create the hold */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description CHARGER_UNAVAILABLE: the charger did not start; PAYMENTS_UNAVAILABLE: card payments are not configured for the paymentMode of the driver (commercial points) */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getActiveSession: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ActiveSessionResponseDto"];
                };
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getSession: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                sessionId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SessionDetailResponseDto"];
                };
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description SESSION_NOT_FOUND */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getOrganizationSession: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                organizationId: string;
                sessionId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OrganizationSessionDetailResponseDto"];
                };
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Member without the required organization role */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description SESSION_NOT_FOUND, or organization not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    reviewSessionAnomaly: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                organizationId: string;
                sessionId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReviewSessionAnomalyRequestDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OrganizationSessionDetailResponseDto"];
                };
            };
            /** @description Invalid status or note */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Member without the required organization role */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description SESSION_NOT_FOUND, or organization not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description SESSION_NOT_FLAGGED: the session is not flagged as anomalous */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    stopSession: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                sessionId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SessionResponseDto"];
                };
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description SESSION_NOT_FOUND */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description SESSION_ALREADY_ENDED */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    confirmSessionPayment: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                sessionId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SessionResponseDto"];
                };
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description SESSION_NOT_FOUND */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description PAYMENT_NOT_REQUIRED: the session is not paid by card */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description PAYMENT_PROVIDER_ERROR: Stripe could not be reached */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    createSessionPaymentSheet: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                sessionId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaymentSheetDto"];
                };
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description SESSION_NOT_FOUND */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description PAYMENT_NOT_REQUIRED: the session is not paid by card; PAYMENT_NOT_PENDING: the hold is no longer awaiting confirmation */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description PAYMENT_PROVIDER_ERROR: Stripe could not be reached */
            502: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    handleStripeWebhook: {
        parameters: {
            query?: never;
            header: {
                "stripe-signature": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WebhookReceiptDto"];
                };
            };
            /** @description INVALID_WEBHOOK_SIGNATURE */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description PAYMENTS_UNAVAILABLE: the webhook secret is not configured */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    handleStripeLiveWebhook: {
        parameters: {
            query?: never;
            header: {
                "stripe-signature": string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["WebhookReceiptDto"];
                };
            };
            /** @description INVALID_WEBHOOK_SIGNATURE */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description PAYMENTS_UNAVAILABLE: the live webhook secret is not configured */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    exportMonthlyStatementCsv: {
        parameters: {
            query?: {
                /** @description Calendar month in America/Sao_Paulo; defaults to the current month */
                month?: string;
            };
            header?: never;
            path: {
                organizationId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "text/csv": string;
                };
            };
            /** @description Invalid month */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Member without the required organization role */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Organization not found or user is not a member */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getMonthlyStatement: {
        parameters: {
            query?: {
                /** @description Calendar month in America/Sao_Paulo; defaults to the current month */
                month?: string;
            };
            header?: never;
            path: {
                organizationId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MonthlyStatementResponseDto"];
                };
            };
            /** @description Invalid month */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Member without the required organization role */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Organization not found or user is not a member */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getMyMonthlyStatement: {
        parameters: {
            query?: {
                /** @description Condominium to read when the user has a unit in more than one; defaults to the first one by name */
                organizationId?: string;
            };
            header?: never;
            path: {
                /** @description Calendar month in America/Sao_Paulo */
                month: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MyMonthlyStatementResponseDto"];
                };
            };
            /** @description Invalid month or organization id */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description The user has no unit in a private organization, or not in the requested one */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    listOrganizationSessions: {
        parameters: {
            query?: {
                page?: number;
                pageSize?: number;
                month?: string;
                unit?: string;
                status?: components["schemas"]["ChargingSessionStatus"];
                chargePointId?: string;
                /** @description true keeps only the sessions flagged as anomalous; false keeps the ones not flagged (including the unscored) */
                anomaly?: boolean;
                /** @description Keeps only the flagged sessions with this review status */
                reviewStatus?: components["schemas"]["AnomalyReviewStatus"];
            };
            header?: never;
            path: {
                organizationId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OrganizationSessionPageDto"];
                };
            };
            /** @description Invalid filters */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Member without the required organization role */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Organization not found or user is not a member */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getOrganizationOverview: {
        parameters: {
            query?: {
                /** @description Calendar month in America/Sao_Paulo; defaults to the current month */
                month?: string;
            };
            header?: never;
            path: {
                organizationId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OrganizationOverviewResponseDto"];
                };
            };
            /** @description Invalid month */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Member without the required organization role */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Organization not found or user is not a member */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    getMyConsents: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MyConsentsResponseDto"];
                };
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    updateMyConsents: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateMyConsentsRequestDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MyConsentsResponseDto"];
                };
            };
            /** @description Invalid payload or REQUIRED_CONSENT: a required purpose was sent as not granted */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description TERMS_VERSION_OUTDATED: the terms version is not the current one */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    exportMyData: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MyDataExportResponseDto"];
                };
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    requestAccountDeletion: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RequestAccountDeletionRequestDto"];
            };
        };
        responses: {
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DeletionRequestResponseDto"];
                };
            };
            /** @description Invalid payload */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Missing or invalid access token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
}
